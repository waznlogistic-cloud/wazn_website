import { useState, useEffect } from "react";
import { Form, Input, DatePicker, Select, Button, Card, Space, Steps, Spin, Tooltip, App } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircleOutlined, CreditCardOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/authContext";
import { supabase } from "@/lib/supabase";
import AddressPicker from "@/modules/core/components/AddressPicker";
import aramexLogo from "@/assets/aramex.svg";
import mrsoolLogo from "@/assets/marsool.svg";

const { Option } = Select;

interface ShippingProvider {
  id: string;
  name: string;
  logo: string;
  rating: number;
  price: number;
  shippingType: string;
  isEstimated?: boolean; // Flag to indicate if price is estimated/default
}

export default function CreateOrderMultiStep() {
  const { user } = useAuth();
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ShippingProvider | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingProvider[]>([]);
  const [orderData, setOrderData] = useState<any>({});
  const [calculatingRates, setCalculatingRates] = useState(false);
  const [formValues, setFormValues] = useState<any>({}); // Store form values for summary
  const [rateCalculationDetails, setRateCalculationDetails] = useState<any>(null); // Store rate calculation details
  const [senderLocation, setSenderLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [receiverLocation, setReceiverLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [providerMapping, setProviderMapping] = useState<Record<string, string>>({}); // Maps service ID to provider UUID
  const [providerMappingError, setProviderMappingError] = useState<string | null>(null); // Track provider mapping errors

  // Fetch provider records from database to map external services to provider UUIDs
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setProviderMappingError(null);
        // Fetch providers that match external service names (case-insensitive)
        const { data: providers, error } = await supabase
          .from("providers")
          .select("id, company_name")
          .or("company_name.ilike.%Aramex%,company_name.ilike.%Mrsool%");

        if (error) {
          console.error("Failed to fetch providers:", error);
          setProviderMappingError("فشل تحميل بيانات شركات الشحن. يرجى المحاولة مرة أخرى.");
          message.error("فشل تحميل بيانات شركات الشحن. يرجى تحديث الصفحة والمحاولة مرة أخرى.");
          return;
        }

        // Create mapping from service identifier to provider UUID
        const mapping: Record<string, string> = {};
        if (providers) {
          for (const provider of providers) {
            const companyNameUpper = provider.company_name.toUpperCase();
            if (companyNameUpper.includes("ARAMEX")) {
              mapping["aramex"] = provider.id;
            } else if (companyNameUpper.includes("MRSOOL")) {
              mapping["mrsool"] = provider.id;
            }
          }
        }
        setProviderMapping(mapping);
        
        // Warn if no providers found
        if (Object.keys(mapping).length === 0) {
          console.warn("No Aramex or Mrsool providers found in database");
          setProviderMappingError("لم يتم العثور على شركات الشحن في قاعدة البيانات. يرجى التأكد من إعداد الشركات أولاً.");
        }
      } catch (error) {
        console.error("Error fetching providers:", error);
        setProviderMappingError("حدث خطأ أثناء تحميل بيانات شركات الشحن. يرجى المحاولة مرة أخرى.");
        message.error("حدث خطأ أثناء تحميل بيانات شركات الشحن. يرجى تحديث الصفحة والمحاولة مرة أخرى.");
      }
    };

    fetchProviders();
  }, []);

  // Check URL parameter for step (used when redirecting from payment success)
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam) {
      const step = parseInt(stepParam, 10);
      if (!isNaN(step) && step >= 0 && step <= 3) {
        setCurrentStep(step);
      }
    }
  }, [searchParams]);

  // Calculate rates when shipment details are ready
  useEffect(() => {
    const calculateRates = async () => {
      // Only calculate rates when we're on step 1 (shipping company selection)
      if (currentStep !== 1) {
        return;
      }
      
      // Check if all required data is available
      if (!orderData.weight || !orderData.senderAddress || !orderData.receiverAddress || !orderData.shipmentType || !orderData.deliveryMethod) {
        console.log("⏳ Waiting for shipment details:", {
          weight: !!orderData.weight,
          senderAddress: !!orderData.senderAddress,
          receiverAddress: !!orderData.receiverAddress,
          shipmentType: !!orderData.shipmentType,
          deliveryMethod: !!orderData.deliveryMethod,
        });
        return;
      }
      
      setCalculatingRates(true);
      const shippingOptionsList: ShippingProvider[] = [];
      
      // Helper functions to calculate default prices (defined outside try-catch for accessibility)
      const getDefaultAramexPrice = (weight: number): number => {
        // Default pricing: base 35 SAR + weight-based charge
        const basePrice = 35;
        const weightCharge = Math.max(weight - 1, 0) * 5; // 5 SAR per kg above 1kg
        const total = basePrice + weightCharge;
        // Apply 7% profit margin
        return Math.round(total * 1.07 * 100) / 100;
      };

      const getDefaultMrsoolPrice = (): number => {
        // Default pricing: base 27.5 SAR + estimated distance charge (assume 20km = 4 SAR) + 6 SAR margin
        const basePrice = 27.5;
        const estimatedDistanceCharge = 4; // Assume ~20km
        const margin = 6;
        return basePrice + estimatedDistanceCharge + margin;
      };
      
      try {
          // Dynamically import services and utilities
          const [
            { aramexService },
            { mrsoolService },
            { parseAddressString },
            { getProductGroup, getAramexProductMapping },
            { getIntegrationsConfig },
          ] = await Promise.all([
            import("@/services/aramex"),
            import("@/services/mrsool"),
            import("@/utils/addressParser"),
            import("@/config/aramexMappings"),
            import("@/config/integrations"),
          ]);
          
          const config = getIntegrationsConfig();

          // Calculate Aramex rates if enabled (wrap in try-catch so it doesn't block Mrsool)
          if (config.aramex.enabled) {
            try {
              // Validate all required Aramex fields are present
              const requiredFields = {
                accountNumber: config.aramex.accountNumber,
                userName: config.aramex.userName,
                password: config.aramex.password,
                accountPin: config.aramex.accountPin,
                accountEntity: config.aramex.accountEntity,
                accountCountryCode: config.aramex.accountCountryCode,
              };

              const missingFields = Object.entries(requiredFields)
                .filter(([_, value]) => !value)
                .map(([key]) => key);

              if (missingFields.length > 0) {
                throw new Error(
                  `Missing Aramex credentials: ${missingFields.join(", ")}. Please check your .env.local file.`
                );
              }

              // Ensure Aramex service is initialized (it should be initialized at app startup, but ensure it here)
              aramexService.initialize({
                accountNumber: requiredFields.accountNumber as string,
                userName: requiredFields.userName as string,
                password: requiredFields.password as string,
                accountPin: requiredFields.accountPin as string,
                accountEntity: requiredFields.accountEntity as string,
                accountCountryCode: requiredFields.accountCountryCode as string,
                apiUrl: config.aramex.apiUrl,
              });

              // Parse addresses
              const senderAddress = parseAddressString(orderData.senderAddress);
              const receiverAddress = parseAddressString(orderData.receiverAddress);

              // Validate parsed addresses have valid country codes
              if (!senderAddress.countryCode || senderAddress.countryCode.length !== 2) {
                throw new Error(
                  `عنوان المرسل غير صحيح: لم يتم تحديد رمز البلد. يرجى التأكد من أن العنوان يتضمن اسم البلد (مثال: "الرياض، السعودية").`
                );
              }
              if (!receiverAddress.countryCode || receiverAddress.countryCode.length !== 2) {
                throw new Error(
                  `عنوان المستلم غير صحيح: لم يتم تحديد رمز البلد. يرجى التأكد من أن العنوان يتضمن اسم البلد (مثال: "نيويورك، الولايات المتحدة").`
                );
              }

              // Determine product group and type
              const productGroup = getProductGroup(
                senderAddress.countryCode,
                receiverAddress.countryCode
              );
              const productMapping = getAramexProductMapping(
                orderData.shipmentType,
                orderData.deliveryMethod || "standard",
                productGroup
              );

              console.log("🚀 Starting Aramex rate calculation:", {
                sender: { city: senderAddress.city, country: senderAddress.countryCode },
                receiver: { city: receiverAddress.city, country: receiverAddress.countryCode },
                weight: orderData.weight,
                productGroup: productMapping.productGroup,
                productType: productMapping.productType,
              });

              // Calculate rate using Aramex API with timeout protection
              const rateResponse = await Promise.race([
                aramexService.calculateRate({
                  shipper: {
                    countryCode: senderAddress.countryCode,
                    city: senderAddress.city,
                    zipCode: senderAddress.postCode,
                  },
                  consignee: {
                    countryCode: receiverAddress.countryCode,
                    city: receiverAddress.city,
                    zipCode: receiverAddress.postCode,
                  },
                  details: {
                    productGroup: productMapping.productGroup,
                    productType: productMapping.productType,
                    paymentType: "P", // Prepaid
                    weight: orderData.weight ? Number(orderData.weight) : 1,
                    weightUnit: "KG",
                    numberOfPieces: 1,
                    descriptionOfGoods: "Parcel",
                    goodsOriginCountry: senderAddress.countryCode, // Goods originate from shipper's country
                  },
                }),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error("Aramex rate calculation timed out after 30 seconds")), 30000)
                ),
              ]) as any;

              // Check for errors in response
              // Note: Aramex API uses capitalized property names (Type, Message, Code)
              if (rateResponse.notifications && rateResponse.notifications.length > 0) {
                const errors = rateResponse.notifications.filter((n: any) => n.Type === "Error" || n.type === "Error");
                if (errors.length > 0) {
                  const errorMessages = errors.map((e: any) => e.Message || e.message || JSON.stringify(e)).join(", ");
                  throw new Error(errorMessages);
                }
              }

              // Validate that we got a valid price
              if (!rateResponse.totalAmount || rateResponse.totalAmount <= 0) {
                throw new Error(
                  `Invalid rate returned: ${rateResponse.totalAmount}. Please check your shipment details.`
                );
              }

              // Apply 7% profit margin markup
              const PROFIT_MARGIN = 0.07; // 7%
              const basePrice = rateResponse.totalAmount;
              const finalPrice = Math.round(basePrice * (1 + PROFIT_MARGIN) * 100) / 100; // Round to 2 decimal places

              // Store rate calculation details for verification (include both base and final price)
              setRateCalculationDetails({
                totalAmount: basePrice,
                finalAmount: finalPrice,
                profitMargin: PROFIT_MARGIN,
                currencyCode: rateResponse.currencyCode,
                productGroup: rateResponse.productGroup,
                productType: rateResponse.productType,
                notifications: rateResponse.notifications,
                calculatedAt: new Date().toISOString(),
              });

              // Log rate calculation for debugging
              console.log("✅ Aramex Rate Calculation Success:", {
                weight: orderData.weight,
                productGroup: productMapping.productGroup,
                productType: productMapping.productType,
                senderCity: senderAddress.city,
                senderCountry: senderAddress.countryCode,
                receiverCity: receiverAddress.city,
                receiverCountry: receiverAddress.countryCode,
                baseRate: basePrice,
                finalPrice: finalPrice,
                profitMargin: `${(PROFIT_MARGIN * 100).toFixed(0)}%`,
                currency: rateResponse.currencyCode,
              });

              // Add Aramex to shipping options
              shippingOptionsList.push({
                id: "aramex",
                name: "ارامكس",
                logo: aramexLogo,
                rating: 5,
                price: finalPrice, // Final price with 7% markup
                shippingType: orderData.deliveryMethod === "express" ? "شحن سريع" : "شحن عادي",
              });
            } catch (aramexError: any) {
              console.error("❌ Error calculating Aramex rates:", aramexError);
              console.log("💰 Using default Aramex price as fallback");
              
              // Use default price when API fails
              const defaultPrice = getDefaultAramexPrice(orderData.weight ? Number(orderData.weight) : 1);
              shippingOptionsList.push({
                id: "aramex",
                name: "ارامكس",
                logo: aramexLogo,
                rating: 5,
                price: defaultPrice,
                shippingType: orderData.deliveryMethod === "express" ? "شحن سريع" : "شحن عادي",
                isEstimated: true, // Flag to indicate this is an estimated price
              });
            }
          }
          
          // Calculate Mrsool rates if enabled
          if (config.mrsool.enabled) {
            console.log("✅ Mrsool is enabled, calculating rates...");
            
            if (!senderLocation || !receiverLocation) {
              console.warn("⚠️ Mrsool is enabled but locations are missing, using default price:", {
                senderLocation: !!senderLocation,
                receiverLocation: !!receiverLocation,
              });
              
              // Use default price when locations are missing
              const defaultPrice = getDefaultMrsoolPrice();
              shippingOptionsList.push({
                id: "mrsool",
                name: "مرسول",
                logo: mrsoolLogo,
                rating: 5,
                price: defaultPrice,
                shippingType: "توصيل سريع",
                isEstimated: true, // Flag to indicate this is an estimated price
              });
            } else {
              try {
                // Ensure Mrsool service is initialized
                if (!mrsoolService.isInitialized()) {
                  if (!config.mrsool.apiKey) {
                    console.warn("⚠️ Mrsool API key is missing, using default price");
                    // Use default price if API key is missing
                    const defaultPrice = getDefaultMrsoolPrice();
                    shippingOptionsList.push({
                      id: "mrsool",
                      name: "مرسول",
                      logo: mrsoolLogo,
                      rating: 5,
                      price: defaultPrice,
                      shippingType: "توصيل سريع",
                      isEstimated: true,
                    });
                    throw new Error("Mrsool API key is missing");
                  }
                  mrsoolService.initialize({
                    apiKey: config.mrsool.apiKey,
                    apiUrl: config.mrsool.apiUrl,
                  });
                }
                
                console.log("🚀 Starting Mrsool rate calculation:", {
                  senderLocation,
                  receiverLocation,
                  weight: orderData.weight,
                });
                
                // Calculate Mrsool rate
                const mrsoolRateResponse = await mrsoolService.calculateRate({
                  pickup: {
                    latitude: senderLocation.lat,
                    longitude: senderLocation.lng,
                    address: orderData.senderAddress,
                  },
                  delivery: {
                    latitude: receiverLocation.lat,
                    longitude: receiverLocation.lng,
                    address: orderData.receiverAddress,
                  },
                  weight: orderData.weight ? Number(orderData.weight) : 1,
                });
                
                // Apply Wazn margin (6 SAR) to Mrsool base price
                const mrsoolFinalPrice = mrsoolService.applyWaznMargin(mrsoolRateResponse.totalPrice);
                
                console.log("✅ Mrsool Rate Calculation Success:", {
                  distance: mrsoolRateResponse.distance,
                  basePrice: mrsoolRateResponse.basePrice,
                  distanceCharge: mrsoolRateResponse.distanceCharge,
                  totalPrice: mrsoolRateResponse.totalPrice,
                  finalPrice: mrsoolFinalPrice,
                  margin: "6 SAR",
                });
                
                // Add Mrsool to shipping options
                shippingOptionsList.push({
                  id: "mrsool",
                  name: "مرسول",
                  logo: mrsoolLogo,
                  rating: 5,
                  price: mrsoolFinalPrice,
                  shippingType: "توصيل سريع",
                });
              } catch (mrsoolError: any) {
                console.error("❌ Error calculating Mrsool rates:", mrsoolError);
                
                // Only add default price if it wasn't already added (e.g., if API key was missing)
                const mrsoolAlreadyAdded = shippingOptionsList.some(opt => opt.id === "mrsool");
                if (!mrsoolAlreadyAdded) {
                  console.log("💰 Using default Mrsool price as fallback");
                  const defaultPrice = getDefaultMrsoolPrice();
                  shippingOptionsList.push({
                    id: "mrsool",
                    name: "مرسول",
                    logo: mrsoolLogo,
                    rating: 5,
                    price: defaultPrice,
                    shippingType: "توصيل سريع",
                    isEstimated: true, // Flag to indicate this is an estimated price
                  });
                }
              }
            }
          } else {
            console.log("ℹ️ Mrsool is not enabled in configuration. Add VITE_MRSOOL_ENABLED=true to .env.local");
          }
          
          // Log summary of available providers
          console.log("📋 Shipping Options Summary:", {
            totalOptions: shippingOptionsList.length,
            options: shippingOptionsList.map(opt => ({ id: opt.id, name: opt.name, price: opt.price, isEstimated: opt.isEstimated })),
            aramexEnabled: config.aramex.enabled,
            mrsoolEnabled: config.mrsool.enabled,
            mrsoolLocationsAvailable: !!(senderLocation && receiverLocation),
          });
          
          // Always show default shipping options for testing, even if integrations aren't configured
          // This ensures the app works on deployed versions without requiring environment setup
          if (shippingOptionsList.length === 0) {
            console.log("⚠️ No shipping options calculated, using default options for testing");
            
            // Add default Aramex option
            const defaultAramexPrice = getDefaultAramexPrice(orderData.weight ? Number(orderData.weight) : 1);
            shippingOptionsList.push({
              id: "aramex",
              name: "ارامكس",
              logo: aramexLogo,
              rating: 5,
              price: defaultAramexPrice,
              shippingType: orderData.deliveryMethod === "express" ? "شحن سريع" : "شحن عادي",
              isEstimated: true,
            });
            
            // Add default Mrsool option
            const defaultMrsoolPrice = getDefaultMrsoolPrice();
            shippingOptionsList.push({
              id: "mrsool",
              name: "مرسول",
              logo: mrsoolLogo,
              rating: 5,
              price: defaultMrsoolPrice,
              shippingType: "توصيل سريع",
              isEstimated: true,
            });
            
            // Show info message that default prices are being used
            message.info({
              content: "يتم استخدام أسعار تقديرية للاختبار. سيتم تحديث الأسعار عند تفعيل التكاملات.",
              duration: 6,
            });
          }
          
          // Set all shipping options
          setShippingOptions(shippingOptionsList);
          
          // Show info message if any prices are estimated
          const estimatedCount = shippingOptionsList.filter(opt => opt.isEstimated).length;
          if (estimatedCount > 0 && estimatedCount < shippingOptionsList.length) {
            message.info({
              content: `تم استخدام أسعار تقديرية لـ ${estimatedCount} من شركات الشحن بسبب عدم توفر الاتصال بالخادم. سيتم تحديث الأسعار عند توفر الاتصال.`,
              duration: 8,
            });
          }
        } catch (error: any) {
          console.error("❌ Error calculating rates:", error);
          console.error("Error details:", {
            message: error.message,
            stack: error.stack,
            orderData: {
              weight: orderData.weight,
              senderAddress: orderData.senderAddress,
              receiverAddress: orderData.receiverAddress,
              shipmentType: orderData.shipmentType,
              deliveryMethod: orderData.deliveryMethod,
            },
          });
          
          // Always ensure we have default options for testing, even if there was an error
          if (shippingOptionsList.length === 0) {
            console.log("⚠️ Error occurred and no options available, adding default options for testing");
            
            // Add default options as fallback - always show options for testing
            const defaultAramexPrice = getDefaultAramexPrice(orderData.weight ? Number(orderData.weight) : 1);
            shippingOptionsList.push({
              id: "aramex",
              name: "ارامكس",
              logo: aramexLogo,
              rating: 5,
              price: defaultAramexPrice,
              shippingType: orderData.deliveryMethod === "express" ? "شحن سريع" : "شحن عادي",
              isEstimated: true,
            });
            
            const defaultMrsoolPrice = getDefaultMrsoolPrice();
            shippingOptionsList.push({
              id: "mrsool",
              name: "مرسول",
              logo: mrsoolLogo,
              rating: 5,
              price: defaultMrsoolPrice,
              shippingType: "توصيل سريع",
              isEstimated: true,
            });
            
            setShippingOptions(shippingOptionsList);
            message.info({
              content: "يتم استخدام أسعار تقديرية للاختبار. يمكنك المتابعة مع هذه الأسعار.",
              duration: 6,
            });
          } else {
            // Some options available - show warning but continue
            message.warning({
              content: `تم حساب بعض أسعار الشحن بنجاح، ولكن حدث خطأ في حساب البعض الآخر. سيتم عرض الخيارات المتاحة.`,
              duration: 5,
            });
            // Set available options even if one failed
            setShippingOptions(shippingOptionsList);
          }
        } finally {
          // Always reset loading state, even if there was an error
          setCalculatingRates(false);
        }
    };

    calculateRates();
  }, [currentStep, orderData.weight, orderData.senderAddress, orderData.receiverAddress, orderData.shipmentType, orderData.deliveryMethod, senderLocation, receiverLocation, message]);

  const steps = [
    {
      title: "تفاصيل الشحنة",
      content: "shipment-details",
    },
    {
      title: "اختيار شركة الشحن",
      content: "shipping",
    },
    {
      title: "الدفع",
      content: "payment",
    },
    {
      title: "التأكيد",
      content: "confirmation",
    },
  ];

  // Step 1: Shipment Details (all info including sender/receiver)
  const renderShipmentDetailsStep = () => {
    return (
      <div className="space-y-8">
        {/* Shipment Basic Info */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-800">معلومات الشحنة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="shipmentDate"
              label="تاريخ الشحن"
              rules={[{ required: true, message: "يرجى اختيار تاريخ الشحن" }]}
            >
              <DatePicker
                size="large"
                className="w-full rounded-lg"
                format="DD-MM-YYYY"
                placeholder="تاريخ الشحن"
              />
            </Form.Item>

            <Form.Item
              name="shipmentType"
              label="نوع الشحنة"
              rules={[{ required: true, message: "يرجى اختيار نوع الشحنة" }]}
            >
              <Select size="large" className="rounded-lg" placeholder="نوع الشحنة">
                <Option value="document">مستندات</Option>
                <Option value="package">طرد</Option>
                <Option value="fragile">قابل للكسر</Option>
                <Option value="heavy">ثقيل</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="weight"
              label="وزن الشحنة"
              rules={[
                {
                  validator: (_, value) => {
                    if (!value || value === "" || value === null || value === undefined) {
                      return Promise.reject(new Error("يرجى إدخال وزن الشحنة"));
                    }
                    const numValue = Number(value);
                    if (isNaN(numValue)) {
                      return Promise.reject(new Error("يرجى إدخال رقم صحيح"));
                    }
                    if (numValue < 1) {
                      return Promise.reject(new Error("يجب أن يكون الوزن على الأقل 1 كجم"));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                size="large"
                className="rounded-lg"
                placeholder="وزن الشحنة"
                type="number"
                min={1}
                step={0.1}
                addonAfter="كجم"
                onKeyDown={(e) => {
                  if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                    e.preventDefault();
                  }
                }}
              />
            </Form.Item>

            <Form.Item
              name="deliveryMethod"
              label="طريقة التوصيل"
              rules={[{ required: true, message: "يرجى اختيار طريقة التوصيل" }]}
            >
              <Select size="large" className="rounded-lg" placeholder="طريقة التوصيل">
                <Option value="standard">عادي</Option>
                <Option value="express">سريع</Option>
                <Option value="same-day">نفس اليوم</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        {/* Sender Details */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">بيانات المرسل</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="senderName"
              label="الاسم الكامل"
              rules={[{ required: true, message: "يرجى إدخال الاسم الكامل" }]}
              extra="كما يظهر في الهوية الوطنية"
            >
              <Input size="large" className="rounded-lg" placeholder="الاسم الكامل" />
            </Form.Item>

            <Form.Item
              name="senderEmail"
              label="البريد الإلكتروني"
              rules={[
                { required: true, message: "يرجى إدخال البريد الإلكتروني" },
                { type: "email", message: "يرجى إدخال بريد إلكتروني صحيح" },
              ]}
            >
              <div className="flex gap-2">
                <Input
                  size="large"
                  className="rounded-lg flex-1"
                  placeholder="example@gmail.com"
                />
                <Button size="large" className="rounded-lg">
                  التحقق
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              name="senderPhone"
              label="رقم الهاتف"
              rules={[{ required: true, message: "يرجى إدخال رقم الهاتف" }]}
            >
              <div className="flex gap-2">
                <Input
                  size="large"
                  className="rounded-lg flex-1"
                  placeholder="+966 00 000 0000"
                />
                <Button size="large" className="rounded-lg">
                  التحقق
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              name="senderAddress"
              label="عنوان الإرسال"
              rules={[{ required: true, message: "يرجى تحديد عنوان الإرسال" }]}
              className="md:col-span-2"
            >
              <AddressPicker 
                placeholder="ابحث عن عنوان الإرسال أو انقر على الخريطة"
                onLocationChange={(location) => {
                  if (location) {
                    setSenderLocation({ lat: location.lat, lng: location.lng });
                  } else {
                    setSenderLocation(null);
                  }
                }}
              />
            </Form.Item>
          </div>
        </div>

        {/* Recipient Details */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold mb-6 text-gray-800">بيانات المستلم</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="receiverName"
              label="الاسم الكامل"
              rules={[{ required: true, message: "يرجى إدخال الاسم الكامل" }]}
            >
              <Input size="large" className="rounded-lg" placeholder="الاسم الكامل" />
            </Form.Item>

            <Form.Item
              name="receiverEmail"
              label="البريد الإلكتروني"
              rules={[
                { required: true, message: "يرجى إدخال البريد الإلكتروني" },
                { type: "email", message: "يرجى إدخال بريد إلكتروني صحيح" },
              ]}
            >
              <div className="flex gap-2">
                <Input
                  size="large"
                  className="rounded-lg flex-1"
                  placeholder="example@gmail.com"
                />
                <Button size="large" className="rounded-lg">
                  التحقق
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              name="receiverPhone"
              label="رقم الهاتف"
              rules={[{ required: true, message: "يرجى إدخال رقم الهاتف" }]}
            >
              <div className="flex gap-2">
                <Input
                  size="large"
                  className="rounded-lg flex-1"
                  placeholder="+966 00 000 0000"
                />
                <Button size="large" className="rounded-lg">
                  التحقق
                </Button>
              </div>
            </Form.Item>

            <Form.Item
              name="receiverAddress"
              label="عنوان الاستلام"
              rules={[{ required: true, message: "يرجى تحديد عنوان الاستلام" }]}
              className="md:col-span-2"
            >
              <AddressPicker 
                placeholder="ابحث عن عنوان الاستلام أو انقر على الخريطة"
                onLocationChange={(location) => {
                  if (location) {
                    setReceiverLocation({ lat: location.lat, lng: location.lng });
                  } else {
                    setReceiverLocation(null);
                  }
                }}
              />
            </Form.Item>
          </div>
        </div>
      </div>
    );
  };

  // Step 2: Shipping Company Selection (Only Aramex)
  const renderShippingStep = () => {
    return (
      <div>
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2 text-gray-800">اختر شركة الشحن</h3>
          <p className="text-gray-500 text-sm mb-6">اختر شركة الشحن المناسبة لطلبك</p>
          {calculatingRates ? (
            <div className="text-center py-8">
              <Spin size="large" />
              <p className="mt-4 text-gray-600">جاري حساب أسعار الشحن...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shippingOptions.length > 0 ? (
              shippingOptions.map((provider) => (
                <Card
                  key={provider.id}
                  className={`cursor-pointer transition-all ${
                    selectedProvider?.id === provider.id ? "border-2 border-[#6E69D1]" : ""
                  }`}
                  onClick={() => setSelectedProvider(provider)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={provider.logo} alt={provider.name} className="h-12 w-auto" />
                      <div>
                        <h4 className="font-semibold text-lg">{provider.name}</h4>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-600">
                            قيمة الشحن: <span className="font-bold">{provider.price} ريال</span>
                            {provider.isEstimated && (
                              <span className="text-xs text-orange-600 mr-2">(سعر تقديري)</span>
                            )}
                          </p>
                          {rateCalculationDetails && (
                            <Tooltip
                              title={
                                <div className="text-right">
                                  <p className="font-semibold mb-2">تفاصيل السعر:</p>
                                  <p className="text-xs">السعر الأساسي من Aramex:</p>
                                  <p className="font-bold">{rateCalculationDetails.totalAmount} {rateCalculationDetails.currencyCode}</p>
                                  {rateCalculationDetails.finalAmount && (
                                    <>
                                      <p className="text-xs mt-2">هامش الربح ({rateCalculationDetails.profitMargin ? (rateCalculationDetails.profitMargin * 100).toFixed(0) : '7'}%):</p>
                                      <p className="font-bold text-green-400">{rateCalculationDetails.finalAmount} {rateCalculationDetails.currencyCode}</p>
                                    </>
                                  )}
                                  <p className="text-xs mt-2">نوع الخدمة: {rateCalculationDetails.productType}</p>
                                  <p className="text-xs">المجموعة: {rateCalculationDetails.productGroup === "DOM" ? "محلي" : "دولي"}</p>
                                  <p className="text-xs mt-1">تم الحساب: {new Date(rateCalculationDetails.calculatedAt).toLocaleString("ar-SA")}</p>
                                </div>
                              }
                            >
                              <InfoCircleOutlined className="text-blue-500 cursor-help" />
                            </Tooltip>
                          )}
                        </div>
                        <p className="text-gray-600">نوع الشحن: {provider.shippingType}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(provider.rating)].map((_, i) => (
                            <span key={i} className="text-yellow-400">★</span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      type={selectedProvider?.id === provider.id ? "primary" : "default"}
                      className="rounded-lg"
                      style={
                        selectedProvider?.id === provider.id
                          ? { backgroundColor: "#6E69D1", borderColor: "#6E69D1" }
                          : {}
                      }
                    >
                      {selectedProvider?.id === provider.id ? "محدد" : "اختيار"}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                جاري حساب أسعار الشحن...
              </div>
            )}
            </div>
          )}
        </div>
      </div>
    );
  };


  // Step 3: Payment
  const renderPaymentStep = () => {
    // Use stored form values or get from form
    const values = formValues.senderName ? formValues : form.getFieldsValue();
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-800">تفاصيل الطلب النهائية</h3>
          <Card className="rounded-lg">
            <div className="space-y-3">
              <div>
                <p className="text-gray-600">اسم المرسل</p>
                <p className="font-semibold">{values.senderName || formValues.senderName || "-"}</p>
              </div>
              <div>
                <p className="text-gray-600">البريد الإلكتروني</p>
                <p className="font-semibold">{values.senderEmail || formValues.senderEmail || "-"}</p>
              </div>
              <div>
                <p className="text-gray-600">رقم الهاتف</p>
                <p className="font-semibold">{values.senderPhone || formValues.senderPhone || "-"}</p>
              </div>
              <div className="border-t pt-3 mt-3">
                <p className="text-gray-600">اسم المستلم</p>
                <p className="font-semibold">{values.receiverName || formValues.receiverName || "-"}</p>
              </div>
              <div>
                <p className="text-gray-600">البريد الإلكتروني</p>
                <p className="font-semibold">{values.receiverEmail || formValues.receiverEmail || "-"}</p>
              </div>
              <div>
                <p className="text-gray-600">رقم الهاتف</p>
                <p className="font-semibold">{values.receiverPhone || formValues.receiverPhone || "-"}</p>
              </div>
              {rateCalculationDetails && (
                <div className="border-t pt-3 mt-3">
                  <p className="text-xs text-gray-500">
                    السعر الأساسي: {rateCalculationDetails.totalAmount} {rateCalculationDetails.currencyCode}
                  </p>
                  {rateCalculationDetails.finalAmount && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      السعر النهائي (شامل {rateCalculationDetails.profitMargin ? (rateCalculationDetails.profitMargin * 100).toFixed(0) : '7'}% ربح): {rateCalculationDetails.finalAmount} {rateCalculationDetails.currencyCode}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="text-xl font-semibold mb-6 text-gray-800">معلومات الدفع</h3>
          <Card className="rounded-lg">
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm mb-1">المبلغ الإجمالي</p>
                <p className="text-2xl font-bold text-[#6E69D1]">
                  {selectedProvider?.price || 0} ريال
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-gray-600 text-sm mb-2">
                  سيتم توجيهك إلى صفحة الدفع الآمنة لإتمام عملية الدفع
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCardOutlined />
                  <span>جميع طرق الدفع متاحة (بطاقات، Apple Pay، وغيرها)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // Validate all shipment details
        await form.validateFields([
          "shipmentDate",
          "shipmentType",
          "weight",
          "deliveryMethod",
          "senderName",
          "senderEmail",
          "senderPhone",
          "senderAddress",
          "receiverName",
          "receiverEmail",
          "receiverPhone",
          "receiverAddress",
        ]);
        const values = form.getFieldsValue();
        
        // Store all form values for use in payment step summary
        setFormValues(values);
        
        setOrderData({
          shipmentDate: values.shipmentDate,
          shipmentType: values.shipmentType,
          weight: values.weight,
          deliveryMethod: values.deliveryMethod,
          senderAddress: values.senderAddress,
          receiverAddress: values.receiverAddress,
        });
      } else if (currentStep === 1) {
        if (!selectedProvider) {
          message.error("يرجى اختيار شركة الشحن");
          return;
        }
      } else if (currentStep === 2) {
        // Payment step - skip payment processing and go directly to order creation/confirmation
        await handleCreateOrder();
        return; // Don't go to next step, confirmation will be shown
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      message.error("يجب تسجيل الدخول أولاً");
      return;
    }

    if (!selectedProvider) {
      message.error("يرجى اختيار شركة الشحن");
      return;
    }

    try {
      setLoading(true);
      const values = form.getFieldsValue();

      const { getIntegrationsConfig } = await import("@/config/integrations");
      const config = getIntegrationsConfig();

      // Prepare order data to save to sessionStorage (will be used after payment)
      const pendingOrderData = {
        employer_id: user.id,
        ship_type: orderData.shipmentType || "package",
        sender_name: values.senderName,
        sender_phone: values.senderPhone,
        sender_address: values.senderAddress,
        receiver_name: values.receiverName,
        receiver_phone: values.receiverPhone,
        receiver_address: values.receiverAddress,
        weight: orderData.weight ? Number(orderData.weight) : undefined,
        delivery_method: orderData.deliveryMethod || "standard",
        price: selectedProvider.price,
        // provider_id: Map to actual provider UUID from database
        // If selectedProvider.id is a UUID (internal provider), use it directly
        // If it's an external service identifier (aramex, mrsool), look up the provider UUID
        provider_id: (() => {
          // Check if it's already a UUID
          if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(selectedProvider.id)) {
            return selectedProvider.id;
          }
          // Otherwise, look up in provider mapping
          const mappedProviderId = providerMapping[selectedProvider.id.toLowerCase()];
          if (!mappedProviderId) {
            // Provider mapping failed - throw error with user-friendly message
            // The outer catch block will display this message (avoiding duplicate messages)
            const errorMsg = providerMappingError || 
              `فشل العثور على معرف شركة الشحن المحددة (${selectedProvider.id}). يرجى تحديث الصفحة والمحاولة مرة أخرى.`;
            throw new Error(errorMsg);
          }
          return mappedProviderId;
        })(),
        payment_amount: selectedProvider.price,
        payment_currency: config.tapPayments.currency || "SAR",
      };

      // Save order data to sessionStorage for use after payment
      sessionStorage.setItem("pendingOrderData", JSON.stringify(pendingOrderData));

      // Check if Tap Payments is configured
      if (!config.tapPayments.enabled || !config.tapPayments.secretKey || !config.tapPayments.publicKey) {
        throw new Error("Tap Payments is not configured. Please check your environment variables.");
      }

      // Import and ensure Tap Payments service is initialized
      const { tapPaymentsService } = await import("@/services/tapPayments");
      
      // Initialize Tap Payments service if not already initialized
      tapPaymentsService.initialize({
        secretKey: config.tapPayments.secretKey,
        publicKey: config.tapPayments.publicKey,
        merchantId: config.tapPayments.merchantId,
        apiUrl: config.tapPayments.apiUrl,
        redirectUrl: config.tapPayments.redirectUrl || `${window.location.origin}/payment/success`,
        webhookUrl: config.tapPayments.webhookUrl,
        currency: config.tapPayments.currency || "SAR",
      });

      // Get user profile for customer info
      const { getProfile } = await import("@/services/profiles");
      const profile = await getProfile(user.id);

      // Parse phone number (remove +966 if present, ensure it starts with 0)
      let phoneNumber = user.phone || profile?.phone || values.senderPhone || "";
      let countryCode = "+966";
      
      // Normalize phone number
      if (phoneNumber.startsWith("+966")) {
        phoneNumber = phoneNumber.replace("+966", "0");
      } else if (phoneNumber.startsWith("966")) {
        phoneNumber = phoneNumber.replace("966", "0");
      }
      
      // Remove any non-digit characters except leading 0
      phoneNumber = phoneNumber.replace(/\D/g, "");
      if (!phoneNumber.startsWith("0")) {
        phoneNumber = "0" + phoneNumber;
      }

      // Extract first and last name from user metadata or profile
      const fullName = user.user_metadata?.full_name || profile?.full_name || values.senderName || "User";
      const nameParts = fullName.split(" ");
      const firstName = nameParts[0] || "User";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Create Tap Payments charge
      const chargeResponse = await tapPaymentsService.createCharge({
        amount: selectedProvider.price,
        currency: config.tapPayments.currency || "SAR",
        customer: {
          firstName: firstName,
          lastName: lastName,
          email: user.email || "",
          phone: {
            countryCode: countryCode,
            number: phoneNumber.replace(/^0/, ""), // Remove leading 0 for Tap API
          },
        },
        merchant: {
          id: config.tapPayments.merchantId || "",
        },
        redirect: {
          url: `${window.location.origin}/payment/success`,
        },
        description: `Order payment for ${selectedProvider.name} shipping`,
        reference: {
          order: `order_${Date.now()}`,
        },
      });

      // Store Tap charge ID in sessionStorage
      sessionStorage.setItem("tapChargeId", chargeResponse.id);

      // Redirect to Tap Payments transaction URL
      window.location.href = chargeResponse.transaction.url;
    } catch (error: any) {
      console.error("Error creating payment:", error);
      message.error(error?.message || "فشل إنشاء الدفع");
      // Clear sessionStorage on error
      sessionStorage.removeItem("pendingOrderData");
      sessionStorage.removeItem("tapChargeId");
    } finally {
      setLoading(false);
    }
  };

  const renderConfirmationStep = () => {
    const orderDataStr = sessionStorage.getItem("createdOrder");
    if (!orderDataStr) {
      return (
        <div className="text-center py-8">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">جاري تحميل بيانات الطلب...</p>
        </div>
      );
    }

    const orderData = JSON.parse(orderDataStr);
    const trackingNumber = orderData.trackingNumber || orderData.aramex_tracking_number || orderData.tracking_no || "غير متوفر";
    const labelUrl = orderData.aramex_label_url;
    const orderId = orderData.id;

    const handleDownload = () => {
      if (labelUrl) {
        window.open(labelUrl, "_blank");
      } else {
        message.warning("رابط التحميل غير متوفر حالياً");
      }
    };

    const handlePrint = () => {
      if (labelUrl) {
        const printWindow = window.open(labelUrl, "_blank");
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else {
        message.warning("رابط الطباعة غير متوفر حالياً");
      }
    };

    return (
      <div className="text-center">
        <CheckCircleOutlined className="text-6xl text-green-500 mb-4" />
        <h2 className="text-2xl font-semibold mb-4">تم اعتماد طلب الشحن بنجاح.</h2>
        
        {/* Order Summary */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600 text-sm mb-1">اسم المرسل</p>
              <p className="font-semibold">{orderData.sender_name || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">اسم المستلم</p>
              <p className="font-semibold">{orderData.receiver_name || "-"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">نوع الشحنة</p>
              <p className="font-semibold">
                {orderData.ship_type === "document" ? "مستندات" :
                 orderData.ship_type === "package" ? "طرد" :
                 orderData.ship_type === "fragile" ? "قابل للكسر" :
                 orderData.ship_type === "heavy" ? "ثقيل" : orderData.ship_type}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">الوزن</p>
              <p className="font-semibold">{orderData.weight ? `${orderData.weight} كجم` : "-"}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">المبلغ المدفوع</p>
              <p className="font-semibold text-green-600">
                {orderData.payment_amount ? `${orderData.payment_amount} ${orderData.payment_currency || "SAR"}` : "-"}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">حالة الدفع</p>
              <p className="font-semibold">
                {orderData.payment_status === "paid" ? "مدفوع" :
                 orderData.payment_status === "pending" ? "قيد الانتظار" :
                 orderData.payment_status === "failed" ? "فشل" : orderData.payment_status || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Number */}
        <div className="my-6">
          <p className="text-gray-600 mb-2">رقم تتبع الشحن</p>
          <p className="text-3xl font-bold text-[#6E69D1]">{trackingNumber}</p>
        </div>

        {/* Label Preview */}
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center mb-6 relative">
          {labelUrl ? (
            <>
              <img 
                src={labelUrl} 
                alt="بوليصة الشحن" 
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const placeholder = e.currentTarget.parentElement?.querySelector(".label-placeholder");
                  if (placeholder) {
                    placeholder.classList.remove("hidden");
                  }
                }}
              />
              <p className="text-gray-400 hidden label-placeholder">صورة بوليصة الشحن</p>
            </>
          ) : (
            <p className="text-gray-400">صورة بوليصة الشحن</p>
          )}
        </div>

        {/* Action Buttons */}
        <Space size="large">
          <Button
            type="primary"
            size="large"
            className="rounded-lg"
            style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
            onClick={handleDownload}
            disabled={!labelUrl}
          >
            تحميل
          </Button>
          <Button 
            size="large" 
            className="rounded-lg"
            onClick={handlePrint}
            disabled={!labelUrl}
          >
            طباعة
          </Button>
          <Button
            size="large"
            className="rounded-lg"
            onClick={() => navigate("/employer/orders")}
          >
            الخروج
          </Button>
        </Space>

        {/* Track Shipment Link */}
        <div className="mt-6">
          <Button
            type="link"
            onClick={() => navigate(`/employer/orders/${orderId || ""}`)}
            className="text-[#6E69D1]"
          >
            عرض تفاصيل الطلب
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-800">إنشاء طلب جديد</h2>
        <p className="text-gray-500 text-sm">املأ المعلومات التالية لإنشاء طلب شحن جديد</p>
      </div>

      {/* Steps Indicator */}
      <div className="mb-6">
        <Steps 
          current={currentStep} 
          items={steps}
          className="custom-steps"
          size="default"
        />
      </div>

      {/* Form Card */}
      <Card 
        className="rounded-xl shadow-lg border-0"
        bodyStyle={{ padding: "32px" }}
      >
        <Form form={form} layout="vertical">
          {currentStep === 0 && renderShipmentDetailsStep()}
          {currentStep === 1 && renderShippingStep()}
          {currentStep === 2 && renderPaymentStep()}
          {currentStep === 3 && renderConfirmationStep()}

          {currentStep < 3 && (
            <div className="flex justify-between items-center pt-6 mt-8 border-t border-gray-200">
              <Button
                size="large"
                onClick={currentStep === 0 ? () => navigate("/employer/orders") : handlePrev}
                className="rounded-lg h-12 px-8"
                disabled={currentStep === 0}
              >
                السابق
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                className="rounded-lg h-12 px-8 font-semibold"
                loading={loading}
                style={{ backgroundColor: "#6E69D1", borderColor: "#6E69D1" }}
              >
                {currentStep === 2 ? `تأكيد الدفع ${selectedProvider?.price || 0} ريال` : "التالي"}
              </Button>
            </div>
          )}
        </Form>
      </Card>
    </div>
  );
}


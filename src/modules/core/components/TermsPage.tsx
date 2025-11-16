import { Card, Typography, Divider, Row, Col } from "antd";
import Logo from "@/components/Logo";

const { Title, Paragraph, Text } = Typography;

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <Logo className="h-16 w-auto mx-auto" />
        </div>
        <Title level={1} className="!mb-4">
          الشروط والأحكام لاستخدام منصة وزن للخدمات اللوجستية
        </Title>
        <Paragraph className="text-lg text-gray-600">
          يرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام منصة وزن للخدمات اللوجستية. 
          تغطي هذه الشروط المسؤوليات القانونية، شروط الخدمة، سياسات الشحن والدفع، 
          والتعامل مع المنتجات المراجعة والتالفة.
        </Paragraph>
      </div>

      {/* Section 1: Regulatory Terms */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          شروط نظامية والمتجر وإخلاء المسؤولية
        </Title>
        <Paragraph>
          تحدد هذه الشروط القواعد والأحكام التي تحكم استخدام منصة وزن للخدمات اللوجستية. 
          باستخدامك للمنصة، فإنك توافق على الالتزام بهذه الشروط.
        </Paragraph>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={8}>
            <Card className="h-full rounded-lg">
              <Title level={4} className="!mb-2">مسؤولية الناقل القانونية</Title>
              <Paragraph>
                يتحمل الناقل المسؤولية القانونية عن الشحنات خلال فترة النقل والتوصيل 
                وفقاً للقوانين واللوائح المعمول بها.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full rounded-lg">
              <Title level={4} className="!mb-2">المزايا والعيوب المطلوبة</Title>
              <Paragraph>
                يجب على المستخدمين الإعلان بدقة عن محتويات الشحنة والمزايا والعيوب 
                المرتبطة بها قبل إتمام عملية الشحن.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full rounded-lg">
              <Title level={4} className="!mb-2">صحة المحتويات</Title>
              <Paragraph>
                يجب أن تكون جميع المعلومات المقدمة حول الشحنة صحيحة ودقيقة. 
                أي معلومات خاطئة قد تؤدي إلى رفض الشحنة أو فرض غرامات.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Section 2: Prohibited Items */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          المحضورات والمواد الممنوعة
        </Title>
        <Paragraph>
          يحظر شحن المواد الخطرة، المواد المتفجرة، المواد الكيميائية الخطرة، 
          الأسلحة، المواد المخدرة، والمواد المحظورة قانونياً. أي محاولة لشحن 
          هذه المواد ستؤدي إلى رفض الشحنة واتخاذ الإجراءات القانونية المناسبة.
        </Paragraph>
      </Card>

      {/* Section 3: Shipment Declaration */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          الإعلان عن محتويات الشحنة والمسؤولية القانونية
        </Title>
        <Paragraph>
          يجب على المرسل الإعلان بدقة عن محتويات الشحنة. أي إخفاء أو تزوير 
          في المعلومات قد يؤدي إلى مسؤولية قانونية.
        </Paragraph>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={12}>
            <Card className="h-full rounded-lg">
              <Title level={4} className="!mb-2">التعامل مع بوليصة الشحن</Title>
              <Paragraph>
                يجب الاحتفاظ ببوليصة الشحن الأصلية كدليل على عملية الشحن. 
                يمكن استخدامها للمطالبات والتعويضات في حالة حدوث مشاكل.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="h-full rounded-lg">
              <Title level={4} className="!mb-2">خدمة إصدار بوليصات الشحن</Title>
              <Paragraph>
                توفر المنصة خدمة إصدار بوليصات الشحن الإلكترونية التي تعتبر 
                وثائق رسمية معترف بها قانونياً.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Section 4: Payment on Delivery */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          الدفع عند الاستلام وتحويل المبالغ
        </Title>
        <Paragraph>
          يمكن للعملاء اختيار الدفع عند الاستلام. يتم تحويل المبالغ إلى حساب 
          المرسل خلال فترة زمنية محددة بعد التأكد من استلام الشحنة.
        </Paragraph>
        <div className="mt-4 space-y-2">
          <Text strong>01.</Text> اختبار بوليصات الشحن المستلمة
          <br />
          <Text strong>02.</Text> صيغة بيانات الشحن
          <br />
          <Text strong>03.</Text> مراجعة الطلب والتحويل
          <br />
          <Text strong>04.</Text> دفع مبلغ الشحن
        </div>
      </Card>

      {/* Section 5: Shipping Fees */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          رسوم الشحن والأوزان الإضافية
        </Title>
        <Paragraph>
          يتم حساب رسوم الشحن بناءً على الوزن، المسافة، نوع الخدمة، والسرعة المطلوبة. 
          قد يتم فرض رسوم إضافية للوزن الزائد أو الأبعاد الكبيرة.
        </Paragraph>
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <Text className="text-gray-600">
            ملاحظة: تختلف الرسوم حسب نوع الخدمة والوجهة. يرجى مراجعة جدول الرسوم 
            المحدث قبل إتمام عملية الشحن.
          </Text>
        </div>
      </Card>

      {/* Section 6: Policy Retrieval */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          استرجاع قيمة البوليصة والتعديل عليها
        </Title>
        <Paragraph>
          يمكن للمستخدمين استرجاع أو تعديل بوليصة الشحن خلال فترة محددة قبل 
          بدء عملية الشحن. بعد بدء الشحن، قد تكون التعديلات محدودة.
        </Paragraph>

        <div className="mt-4">
          <Title level={4} className="!mb-2">العمل على توقيعات الشحن</Title>
          <Paragraph>
            يجب على المستلم التوقيع على بوليصة الشحن عند الاستلام كدليل على 
            استلام الشحنة في حالة جيدة.
          </Paragraph>
        </div>

        <div className="mt-4">
          <Title level={4} className="!mb-2">استيداع السمة البوليسة</Title>
          <Paragraph>
            يتم الاحتفاظ بنسخة من بوليصة الشحن في النظام لمدة محددة لأغراض 
            المراجعة والمطالبات.
          </Paragraph>
        </div>

        <div className="mt-4">
          <Title level={4} className="!mb-2">القيود الخاصة</Title>
          <Paragraph>
            قد توجد قيود خاصة على أنواع معينة من الشحنات أو الوجهات. 
            يرجى مراجعة القيود قبل إتمام عملية الشحن.
          </Paragraph>
        </div>
      </Card>

      {/* Section 7: Problems and Compensation */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          المشكلات والأضرار والتعويض
        </Title>
        <Paragraph>
          في حالة حدوث أضرار أو مشاكل في الشحنة، يجب الإبلاغ فوراً. 
          يتم تقييم كل حالة بشكل فردي لتحديد التعويض المناسب.
        </Paragraph>

        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={8}>
            <Card className="h-full rounded-lg">
              <Title level={4} className="!mb-2">غير مسموح وزن</Title>
              <Paragraph>
                بعض المواد قد تكون غير مسموح شحنها بسبب الوزن أو الحجم. 
                يرجى التحقق من القيود قبل الشحن.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full rounded-lg">
              <Title level={4} className="!mb-2">تعليمات الشحن</Title>
              <Paragraph>
                يجب اتباع جميع تعليمات الشحن والتعبئة المحددة لضمان سلامة 
                الشحنة أثناء النقل.
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="h-full rounded-lg">
              <Title level={4} className="!mb-2">المخاطر والضرر</Title>
              <Paragraph>
                قد تتعرض الشحنات لمخاطر أثناء النقل. يتم تغطية الأضرار وفقاً 
                لشروط التأمين المحددة.
              </Paragraph>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Section 8: Refund Policy */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          سياسة استرجاع العميل مبلغ شحن المحفظة الإلكترونية ومدتها
        </Title>
        <Paragraph>
          يمكن للعملاء استرجاع المبالغ المدفوعة من المحفظة الإلكترونية وفقاً 
          للشروط والأحكام المحددة.
        </Paragraph>
        <div className="mt-4 space-y-2">
          <Text strong>01.</Text> قفل المحفظة الإلكترونية
          <br />
          <Text strong>02.</Text> فترة الاسترجاع المتاحة
          <br />
          <Text strong>03.</Text> تقديم طلب الاسترجاع
          <br />
          <Text strong>04.</Text> معالجة الطلب والشحن
        </div>
      </Card>

      {/* Section 9: Questions */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          أسئلة الشروط والقوانين
        </Title>
        <Paragraph>
          إذا كان لديك أي أسئلة حول الشروط والأحكام، يرجى التواصل معنا عبر 
          البريد الإلكتروني أو الهاتف. فريق الدعم جاهز للإجابة على استفساراتك.
        </Paragraph>
      </Card>

      {/* Section 10: Refund Conditions */}
      <Card className="mb-6 rounded-xl">
        <Title level={2} className="!mb-4">
          شروط استرجاع المبالغ
        </Title>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          <li>يجب تقديم طلب الاسترجاع خلال 30 يوماً من تاريخ الدفع</li>
          <li>يجب أن تكون الشحنة لم يتم شحنها بعد</li>
          <li>يتم استرجاع المبلغ خلال 5-7 أيام عمل</li>
          <li>قد يتم خصم رسوم معالجة في بعض الحالات</li>
        </ul>
      </Card>

      {/* Footer */}
      <Divider />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <Title level={4} className="!mb-2">تواصل معنا</Title>
          <Paragraph>
            <Text strong>الهاتف:</Text> 7050286465
            <br />
            <Text strong>البريد الإلكتروني:</Text> info@wazn.com
            <br />
            <Text strong>العنوان:</Text> مركز الأعمال السعودي
          </Paragraph>
        </div>
        <div className="text-right">
          <Logo className="h-12 w-auto mb-2" />
          <Text className="text-lg font-semibold">وزن للخدمات اللوجستية</Text>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Wazn. جميع الحقوق محفوظة.
      </div>
    </div>
  );
}


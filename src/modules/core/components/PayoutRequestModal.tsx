import { Modal, Form, InputNumber, Select, Button } from "antd";

export default function PayoutRequestModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onCancel={onClose} title="سحب الرصيد" footer={null} centered>
      <Form layout="vertical">
        <Form.Item label="المبلغ المراد سحبه" name="amount" rules={[{ required: true }]}>
          <InputNumber className="w-full" min={1} placeholder="أدخل المبلغ" />
        </Form.Item>
        <Form.Item label="طريقة السحب" name="method" rules={[{ required: true }]}>
          <Select
            options={[
              { value: "bank", label: "تحويل بنكي" },
              { value: "cash", label: "نقدي" },
            ]}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" block>
          تأكيد السحب
        </Button>
      </Form>
    </Modal>
  );
}

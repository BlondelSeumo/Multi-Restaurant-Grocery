import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import cls from './form.module.scss';

const ToDoForm = ({ onSubmit }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const onFinish = (values) => {
    onSubmit(values);
    form.resetFields();
  };
  return (
    <Form form={form} onFinish={onFinish}>
      <div className={cls.form}>
        <Form.Item
          name='name'
          rules={[
            {
              required: true,
              message: t('required'),
            },
          ]}
          style={{ marginBottom: 0, flex: 1 }}
        >
          <Input placeholder={t('write.your.note...')} />
        </Form.Item>
        <Button htmlType='submit' type='primary'>
          {t('add')}
        </Button>
      </div>
    </Form>
  );
};

export default ToDoForm;

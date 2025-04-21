import { Button, Card, Form } from 'antd';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import moment from 'moment';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import userService from 'services/seller/user';
import { removeFromMenu } from 'redux/slices/menu';
import { toast } from 'react-toastify';
import InputFields from './input-fields';

const ShopUsersForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const params = useParams();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [form] = Form.useForm();
  const [avatar, setAvatar] = useState([]);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const onFinish = (values) => {
    const body = {
      images: avatar?.length ? avatar?.map((item) => item?.name) : undefined,
      firstname: values?.firstname,
      lastname: values?.lastname,
      birthday: moment(values?.birthday).format('YYYY-MM-DD'),
      gender: values?.gender?.value,
      phone: values?.phone,
      email: values?.email,
      password: values?.password,
      password_confirmation: values?.password_confirmation,
      role: params?.role,
    };
    setLoadingBtn(true);
    userService
      .create(body)
      .then(() => {
        toast.success(t('user.successfully.added'));
        const nextUrl = 'seller/shop-users';
        dispatch(removeFromMenu({ ...activeMenu, nextUrl }));
        navigate(`/${nextUrl}?role=${params?.role}`);
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };
  return (
    <Form form={form} layout='vertical' onFinish={onFinish}>
      <Card>
        <InputFields avatar={avatar} setAvatar={setAvatar} form={form} />
      </Card>
      <Card>
        <Button type='primary' htmlType='submit' loading={loadingBtn}>
          {t('save')}
        </Button>
      </Card>
    </Form>
  );
};

export default ShopUsersForm;

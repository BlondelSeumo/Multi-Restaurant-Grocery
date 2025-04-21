import { useTranslation } from 'react-i18next';
import { Button, Card, Col, Form, Row } from 'antd';
import { useEffect, useState } from 'react';
import userService from '../../services/user';
import { toast } from 'react-toastify';
import MapGif from 'assets/video/map.gif';
import DrawingManager from '../../components/drawing-map';

const DeliverymanZone = ({ user_id }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();

  const [triangleCoords, setTriangleCoords] = useState([]);
  const [merge, setMerge] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const fetchDeliverymanZone = (id) => {
    setLoading(true);
    userService
      .showDeliverymanZone(id)
      .then((res) => {
        setTriangleCoords(
          res.data !== undefined
            ? res.data?.map((item) => ({
                lat: item?.[0],
                lng: item?.[1],
              }))
            : [],
        );
      })
      .catch((err) => {
        if (err.response.status === 404) {
          toast.dismiss();
        }
        console.log('err', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (user_id) {
      fetchDeliverymanZone(user_id);
    }
  }, [user_id]);

  const onFinish = () => {
    if (!user_id) {
      toast.error(t('no.user.id'));
      return;
    }
    if (triangleCoords.length < 3) {
      toast.warning(t('place.selected.map'));
      return;
    }

    if (!merge) {
      toast.warning(t('place.selected.map'));
      return;
    }
    const body = {
      user_id,
      address: triangleCoords.map((item) => ({
        0: item.lat,
        1: item.lng,
      })),
    };
    setLoadingBtn(true);
    userService
      .createAndUpdateDeliverymanZone(body)
      .then(() => {
        toast.success(t('successfully.updated'));
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  return (
    <Card loading={loading}>
      <Form layout='vertical' form={form} onFinish={onFinish}>
        <Row gutter={12}>
          <Col span={12}>
            <img
              src={MapGif}
              alt={t('map.gif')}
              style={{ object: 'contain' }}
            />
          </Col>
          <Col span={24}>
            <DrawingManager
              triangleCoords={triangleCoords}
              settriangleCoords={setTriangleCoords}
              setMerge={setMerge}
            />
          </Col>
        </Row>
        <Button
          type='primary'
          htmlType='submit'
          loading={loadingBtn}
          className='mt-4'
        >
          {t('save')}
        </Button>
      </Form>
    </Card>
  );
};

export default DeliverymanZone;

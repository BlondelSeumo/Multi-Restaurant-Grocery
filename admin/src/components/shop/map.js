import { Button, Card, Col, Form, Row, Space } from 'antd';
import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import DrawingManager from 'components/drawing-map';
import { BsArrowsMove } from 'react-icons/bs';
import MapGif from 'assets/video/map.gif';
import deliveryZone from 'services/zone';
import Loading from 'components/loading';
import { toast } from 'react-toastify';
import { fetchSettings } from 'redux/slices/globalSettings';
import { disableRefetch } from 'redux/slices/menu';
import useDidUpdate from 'helpers/useDidUpdate';

const Map = ({ next, prev }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { settings } = useSelector((state) => state.globalSettings);
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);

  const defaultDeliveryZone = useMemo(() => {
    if (
      Array.isArray(settings?.default_delivery_zone) &&
      settings.default_delivery_zone.length
    ) {
      return settings?.default_delivery_zone?.map((item) => ({
        lng: item?.[0],
        lat: item?.[1],
      }));
    }
    return [];
  }, [settings?.default_delivery_zone]);

  const [triangleCoords, setTriangleCoords] = useState(defaultDeliveryZone);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [merge, setMerge] = useState(null);
  const [loading, setLoading] = useState(false);

  const getMap = (id) => {
    setLoading(true);
    deliveryZone
      .getById(id)
      .then((res) => {
        if (res?.data?.address?.length) {
          const coords = res.data?.address?.map((item) => ({
            lat: item[0],
            lng: item[1],
          }));
          setTriangleCoords(coords);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onFinish = () => {
    if (triangleCoords?.length < 3 || !merge) {
      toast.warning(t('please.connect.dots'));
      return;
    }

    setLoadingBtn(true);
    const body = {
      shop_id: activeMenu.data?.id,
      address: triangleCoords?.map((item) => ({
        0: item?.lat,
        1: item?.lng,
      })),
    };
    deliveryZone
      .create(body)
      .then(() => {
        next();
      })
      .finally(() => {
        setLoadingBtn(false);
      });
  };

  useEffect(() => {
    if (activeMenu.data?.id) {
      getMap(activeMenu.data?.id);
      dispatch(fetchSettings({}));
      dispatch(disableRefetch(activeMenu));
    }

    return () => {
      setLoading(false);
      setLoadingBtn(false);
    };
    // eslint-disable-next-line
  }, [activeMenu.data?.id]);

  useDidUpdate(() => {
    if (activeMenu.data?.id && activeMenu.refetch) {
      getMap(activeMenu.data?.id);
      dispatch(fetchSettings({}));
      dispatch(disableRefetch(activeMenu));
    }
    return () => {
      setLoading(false);
      setLoadingBtn(false);
    };
  }, [activeMenu.data?.id, activeMenu.refetch]);

  return (
    <Form form={form} name='map' layout='vertical' onFinish={onFinish}>
      {!loading ? (
        <>
          <Row>
            <Col span={24}>
              <Card title={<h3 className='p-0 m-0'>{t('delivery.zone')}</h3>}>
                <Row gutter={12}>
                  <Col span={24} className={'mb-3'}>
                    <h4>{t('instructions')}</h4>
                    {t(
                      'create.zone.by.click.on.map.and.connect.the.dots.together',
                    )}
                  </Col>
                  <Col span={24} className={'mb-3'}>
                    <Space>
                      <BsArrowsMove size={25} />
                      <p>{t('delivery.zone.text')}</p>
                    </Space>
                  </Col>
                  <Col span={12}>
                    <img
                      src={MapGif}
                      alt='Map GIF'
                      style={{ objectFit: 'contain' }}
                    />
                  </Col>
                  <Col span={24}>
                    <DrawingManager
                      triangleCoords={triangleCoords}
                      settriangleCoords={setTriangleCoords}
                      setMerge={setMerge}
                      withTemplate
                    />
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          <Space>
            <Button htmlType='submit' onClick={() => prev()}>
              {t('prev')}
            </Button>
            <Button type='primary' htmlType='submit' loading={loadingBtn}>
              {t('next')}
            </Button>
          </Space>
        </>
      ) : (
        <Loading />
      )}
    </Form>
  );
};

export default Map;

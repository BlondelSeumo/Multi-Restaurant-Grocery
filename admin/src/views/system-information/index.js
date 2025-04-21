import { useEffect, useState } from 'react';
import { Col, Descriptions, Row, Space, Typography } from 'antd';
import installationService from 'services/installation';
import { useTranslation } from 'react-i18next';
import Card from 'components/card';
import Loading from 'components/loading';

export default function SystemInformation() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);

  useEffect(() => {
    setLoading(true);
    installationService
      .systemInformation()
      .then(({ data }) => setList(Object.entries(data)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <Space className='align-items-center justify-content-between w-100'>
        <Typography.Title
          level={1}
          style={{
            color: 'var(--text)',
            fontSize: '20px',
            fontWeight: 500,
            padding: 0,
            margin: '0 0 20px 0',
          }}
        >
          {t('system.information')}
        </Typography.Title>
      </Space>
      {!loading ? (
        <Row>
          <Col span={12}>
            <Descriptions bordered>
              {list.map((item, index) => (
                <Descriptions.Item key={index} label={item[0]} span={3}>
                  {item[1]}
                </Descriptions.Item>
              ))}
            </Descriptions>
          </Col>
        </Row>
      ) : (
        <Loading />
      )}
    </Card>
  );
}

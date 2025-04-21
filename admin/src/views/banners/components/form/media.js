import { useTranslation } from 'react-i18next';
import { Card, Form } from 'antd';
// import VideoUploaderWithModal from 'components/video-uploader';
import MediaUpload from 'components/upload';
const BannerFormMedia = ({
  form,
  // videoList,
  // setVideoList,
  imageList,
  setImageList,
  loading = false,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <Card title={t('images')} loading={loading}>
        <Form.Item
          name='images'
          rules={[
            {
              required: !imageList?.length,
              message: t('required'),
            },
          ]}
        >
          <MediaUpload
            type='products'
            imageList={imageList}
            setImageList={setImageList}
            form={form}
            multiple={false}
          />
        </Form.Item>
      </Card>
      {/*<Card title={t('video')} loading={loading}>*/}
      {/*  <VideoUploaderWithModal*/}
      {/*    form={form}*/}
      {/*    mediaList={videoList}*/}
      {/*    setMediaList={setVideoList}*/}
      {/*  />*/}
      {/*</Card>*/}
    </>
  );
};

export default BannerFormMedia;

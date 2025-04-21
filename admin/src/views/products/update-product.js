import { Button, Col, Modal, Row } from 'antd';
import { useTranslation } from 'react-i18next';
import { DebounceSelect } from 'components/search';
import React, { useMemo, useState } from 'react';
import shopService from 'services/restaurant';
import productService from 'services/product';
import { toast } from 'react-toastify';

const UpdateProduct = ({ isOpen, handleClose, ids = [] }) => {
  const { t } = useTranslation();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const fetchShops = useMemo(
    () => async (search) => {
      const params = {
        search: search ? search : undefined,
        page: 1,
        perPage: 20,
        status: 'approved',
      };
      return shopService.getAll(params).then(({ data }) =>
        data?.map((item) => ({
          label: item?.translation?.title,
          value: item?.id,
          key: item?.id,
        })),
      );
    },
    [],
  );
  const handleUpdateProduct = () => {
    setLoadingBtn(true);
    const body = {
      products: ids,
    };
    productService
      .sync(body)
      .then(() => {
        toast.success(t('successfully.updated'));
        handleClose();
      })
      .finally(() => setLoadingBtn(false));
  };

  const handleUpdateBranch = () => {
    setLoadingBtn(true);
    const body = {
      shop_id: selectedBranch?.value,
    };
  };

  if (!isOpen) return null;

  const renderView = () => {
    if (!ids?.length) {
      return (
        <>
          <Row gutter={12}>
            <Col span={24}>
              <DebounceSelect
                className='w-100'
                fetchOptions={fetchShops}
                allowClear={false}
                onSelect={(value) => setSelectedBranch(value)}
              />
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={24}>
              <Button onClick={handleUpdateBranch} disabled={!selectedBranch}>
                {t('update')}
              </Button>
            </Col>
          </Row>
        </>
      );
    }
    return (
      <>
        <p>{'Do you really want to update the products?'}</p>
        <div className='d-flex justify-content-end'>
          <Button
            type='primary'
            className='mr-2'
            onClick={handleUpdateProduct}
            loading={loadingBtn}
          >
            {t('yes')}
          </Button>
          <Button onClick={handleClose}>{t('no')}</Button>
        </div>
      </>
    );
  };

  if (ids?.length === 0) return null;

  return (
    <Modal
      title={t('update')}
      visible={isOpen}
      onCancel={handleClose}
      footer={false}
    >
      {renderView()}
    </Modal>
  );
};

export default UpdateProduct;

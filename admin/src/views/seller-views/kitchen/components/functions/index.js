import { Button, Col, Divider, Space, Typography } from 'antd';
import SearchInput from 'components/search-input';
import { useTranslation } from 'react-i18next';
import { useQueryParams } from 'helpers/useQueryParams';
import { toast } from 'react-toastify';
import { Context } from 'context/context';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addMenu } from 'redux/slices/menu';
import { PlusOutlined } from '@ant-design/icons';
import OutlinedButton from 'components/outlined-button';

const KitchenFunctions = ({ id = null }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryParams = useQueryParams();
  const { setIsModalVisible } = useContext(Context);

  const goToCreate = () => {
    const url = 'seller/kitchen/create';
    dispatch(
      addMenu({
        id: 'create-kitchen',
        url,
        name: t('create.kitchen'),
      }),
    );
    navigate(`/${url}`);
  };

  const handleDeleteSelected = () => {
    if (!id?.length) {
      toast.warning(t('select.kitchens'));
    } else {
      setIsModalVisible(true);
    }
  };

  const handleFilter = (filter) => {
    if (filter.hasOwnProperty('search')) {
      if (!filter?.search?.trim()?.length) {
        queryParams.reset('search');
        return;
      }
      queryParams.set('search', filter.search);
    }
  };
  return (
    <>
      <Space className='align-items-center justify-content-between w-100'>
        <Typography.Title
          level={1}
          style={{
            color: 'var(--text)',
            fontSize: '20px',
            fontWeight: 500,
            padding: 0,
            margin: 0,
          }}
        >
          {t('kitchens')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToCreate}
          style={{ width: '100%' }}
        >
          {t('add.kitchen')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space
        wrap
        style={{ rowGap: '6px', columnGap: '6px' }}
        className='w-100 justify-content-end'
      >
        <Col style={{ minWidth: '320px' }}>
          <SearchInput
            placeholder={t('search.by.title')}
            handleChange={(e) => handleFilter({ search: e })}
            defaultValue={queryParams.get('search')}
            className='w-100'
            debounceTimeout={1000}
          />
        </Col>
        <OutlinedButton
          color='red'
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteSelected();
          }}
        >
          {t('delete.selection')}
        </OutlinedButton>
      </Space>
      <Divider color='var(--divider)' />
    </>
  );
};

export default KitchenFunctions;

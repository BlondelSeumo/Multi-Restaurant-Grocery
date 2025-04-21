import { useContext, useEffect, useState } from 'react';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Col, Divider, Space, Switch, Table, Typography } from 'antd';
import { Context } from 'context/context';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import careerService from 'services/career';
import { fetchCareer } from 'redux/slices/career';
import { useTranslation } from 'react-i18next';
import FilterColumns from 'components/filter-column';
import SearchInput from 'components/search-input';
import useDidUpdate from 'helpers/useDidUpdate';
import Card from 'components/card';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import OutlinedButton from 'components/outlined-button';
import RiveResult from 'components/rive-result';

const initialFilterValues = {
  search: '',
  page: 1,
  perPage: 10,
  type: 'career',
};

const Career = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const { setIsModalVisible } = useContext(Context);
  const { career, meta, loading } = useSelector(
    (state) => state.career,
    shallowEqual,
  );

  const [filters, setFilters] = useState(initialFilterValues);
  const [id, setId] = useState(null);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [text, setText] = useState(null);
  const initialColumns = [
    {
      title: t('id'),
      dataIndex: 'id',
      key: 'id',
      is_show: true,
    },
    {
      title: t('title'),
      dataIndex: 'translation',
      key: 'translation',
      is_show: true,
      render: (translation) => translation?.title || t('N/A'),
    },
    {
      title: t('translations'),
      dataIndex: 'locales',
      key: 'locales',
      is_show: true,
      render: (locales) => (
        <div className={tableRowClasses.locales}>
          {locales?.map((item, index) => (
            <div
              className={`${tableRowClasses.locale} ${1 & index ? tableRowClasses.odd : tableRowClasses.even}`}
            >
              {item}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: t('category'),
      dataIndex: 'category',
      key: 'category',
      is_show: true,
      render: (category) => category?.translation?.title || t('N/A'),
    },
    {
      title: t('active'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active) => <Switch checked={active} />,
    },
    {
      title: t('actions'),
      key: 'actions',
      dataIndex: 'id',
      is_show: true,
      render: (id) => (
        <div className={tableRowClasses.options}>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.edit}`}
            onClick={(e) => {
              e.stopPropagation();
              goToEdit(id);
            }}
          >
            <EditOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.clone}`}
            onClick={(e) => {
              e.stopPropagation();
              goToClone(id);
            }}
          >
            <CopyOutlined />
          </button>
          <button
            type='button'
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            onClick={(e) => {
              e.stopPropagation();
              setId([id]);
              setIsModalVisible(true);
              setText(true);
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];
  const [columns, setColumns] = useState(initialColumns);

  useDidUpdate(() => {
    setColumns(initialColumns);
  }, [i18n?.store?.data?.[`${i18n?.language}`]?.translation]);

  const paramsData = {
    search: filters?.search || undefined,
    pageSize: filters?.perPage || 10,
    page: filters?.page || 1,
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        id: 'career_edit',
        url: `career/${id}`,
        name: t('edit.career'),
      }),
    );
    navigate(`/career/${id}`);
  };

  const goToAddCategory = () => {
    dispatch(
      addMenu({
        id: 'career_add',
        url: 'career/add',
        name: t('add.career'),
      }),
    );
    navigate('/career/add');
  };

  const goToClone = (id) => {
    dispatch(
      addMenu({
        id: `career-clone`,
        url: `career-clone/${id}`,
        name: t('career.clone'),
      }),
    );
    navigate(`/career-clone/${id}`);
  };

  const categoryDelete = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    careerService
      .delete(params)
      .then(() => {
        dispatch(setRefetch(activeMenu));
        toast.success(t('successfully.deleted'));
      })
      .finally(() => {
        setIsModalVisible(false);
        setLoadingBtn(false);
        setText(null);
        setId(null);
      });
  };

  const rowSelection = {
    selectedRowKeys: id,
    onChange: (key) => {
      setId(key);
    },
  };

  const allDelete = () => {
    if (id === null || id.length === 0) {
      toast.warning(t('select.the.career'));
    } else {
      setIsModalVisible(true);
      setText(false);
    }
  };

  const handleFilter = (type, value) => {
    setFilters((prev) => ({ ...prev, [type]: value, page: 1 }));
  };

  const handleUpdateFilter = (values) => {
    setFilters((prev) => ({ ...prev, ...values }));
  };

  const onChangePagination = (pagination) => {
    const { pageSize: perPage, current: page } = pagination;
    handleUpdateFilter({ perPage, page });
  };

  const fetchCareerLocal = () => {
    dispatch(fetchCareer(paramsData));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchCareerLocal();
    // eslint-disable-next-line
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchCareerLocal();
    }
  }, [activeMenu.refetch]);

  useDidUpdate(() => {
    fetchCareerLocal();
  }, [filters]);

  return (
    <>
      <Card>
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
            {t('career.list')}
          </Typography.Title>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={goToAddCategory}
            style={{ width: '100%' }}
          >
            {t('add.career')}
          </Button>
        </Space>
        <Divider color='var(--divider)' />
        <Space
          wrap
          className='w-100 justify-content-end align-items-center'
          style={{ rowGap: '6px', columnGap: '6px', marginBottom: '20px' }}
        >
          <Col style={{ minWidth: '228px' }}>
            <SearchInput
              placeholder={t('search.by.title')}
              className='w-100'
              handleChange={(value) => handleFilter('search', value)}
              defaultValue={filters?.search}
              resetSearch={!filters?.search}
            />
          </Col>
          <OutlinedButton onClick={allDelete} color='red'>
            {t('delete.selection')}
          </OutlinedButton>
          <FilterColumns columns={columns} setColumns={setColumns} />
        </Space>
        <Table
          locale={{
            emptyText: <RiveResult />,
          }}
          scroll={{ x: true }}
          rowSelection={rowSelection}
          loading={loading}
          columns={columns?.filter((item) => item.is_show)}
          dataSource={career}
          pagination={{
            pageSize: meta?.per_page || 10,
            page: meta?.current_page || 1,
            total: meta?.total || 0,
            current: meta?.current_page || 1,
          }}
          onChange={onChangePagination}
          rowKey={(record) => record.id}
        />
      </Card>

      <CustomModal
        click={categoryDelete}
        text={
          text ? t('confirm.delete.selection') : t('confirm.delete.selection')
        }
        setText={setId}
        loading={loadingBtn}
      />
    </>
  );
};

export default Career;

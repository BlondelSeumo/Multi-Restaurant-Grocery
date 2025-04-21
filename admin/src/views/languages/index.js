import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Space, Tag, Typography, Divider } from 'antd';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Context } from 'context/context';
import { toast } from 'react-toastify';
import CustomModal from 'components/modal';
import languagesService from 'services/languages';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addMenu, disableRefetch, setRefetch } from 'redux/slices/menu';
import { useTranslation } from 'react-i18next';
import { fetchLang } from 'redux/slices/languages';
import useDemo from 'helpers/useDemo';
import Card from 'components/card';
import ColumnImage from 'components/column-image';
import tableRowClasses from 'assets/scss/components/table-row.module.scss';
import useDidUpdate from 'helpers/useDidUpdate';

const Languages = () => {
  const { t } = useTranslation();
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [id, setId] = useState(null);
  const [type, setType] = useState('');
  const { setIsModalVisible } = useContext(Context);

  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDemo, demoFunc } = useDemo();
  const { allLanguages, loading } = useSelector(
    (state) => state.languages,
    shallowEqual,
  );

  const columns = [
    {
      title: t('title'),
      dataIndex: 'title',
      key: 'title',
      is_show: true,
    },
    {
      title: t('image'),
      dataIndex: 'img',
      key: 'img',
      is_show: true,
      render: (img, row) => <ColumnImage image={img} key={row?.id} />,
    },
    {
      title: t('status'),
      dataIndex: 'active',
      key: 'active',
      is_show: true,
      render: (active) =>
        active ? (
          <Tag color='cyan'> {t('active')}</Tag>
        ) : (
          <Tag color='yellow'>{t('inactive')}</Tag>
        ),
    },
    {
      title: t('actions'),
      key: 'actions',
      dataIndex: 'id',
      is_show: true,
      render: (id, row) => (
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
            className={`${tableRowClasses.option} ${tableRowClasses.delete}`}
            disabled={!!row?.deleted_at}
            onClick={(e) => {
              e.stopPropagation();
              setId([id]);
              setType('deleteLang');
              setIsModalVisible(true);
            }}
          >
            <DeleteOutlined />
          </button>
        </div>
      ),
    },
  ];

  const goToAdd = () => {
    dispatch(
      addMenu({
        id: 'add.language',
        url: `language/add`,
        name: t('add.language'),
      }),
    );
    navigate(`/language/add`);
  };

  const goToEdit = (id) => {
    dispatch(
      addMenu({
        url: `language/${id}`,
        id: 'language_edit',
        name: t('edit.language'),
      }),
    );
    navigate(`/language/${id}`);
  };

  const setDefaultLang = () => {
    setLoadingBtn(true);
    languagesService
      .setDefault(id)
      .then(() => {
        toast.success(t('successfully.updated'));

        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setId(null);
        setIsModalVisible(false);
        setLoadingBtn(false);
      });
  };

  const deleteLang = () => {
    setLoadingBtn(true);
    const params = {
      ...Object.assign(
        {},
        ...id.map((item, index) => ({
          [`ids[${index}]`]: item,
        })),
      ),
    };
    languagesService
      .delete(params)
      .then(() => {
        toast.success(t('successfully.deleted'));
        dispatch(setRefetch(activeMenu));
      })
      .finally(() => {
        setId(null);
        setLoadingBtn(false);
        setIsModalVisible(false);
      });
  };

  const fetchLangLocal = () => {
    dispatch(fetchLang({}));
    dispatch(disableRefetch(activeMenu));
  };

  useEffect(() => {
    fetchLangLocal();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      dispatch(fetchLang({}));
      dispatch(disableRefetch(activeMenu));
    }
  }, [activeMenu.refetch]);

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
            margin: 0,
          }}
        >
          {t('languages')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={goToAdd}
          style={{ width: '100%' }}
        >
          {t('add.language')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Table
        scroll={{ x: true }}
        columns={columns?.filter((item) => item.is_show)}
        dataSource={allLanguages}
        rowKey={(record) => record.id}
        loading={loading}
        pagination={false}
        rowSelection={{
          selectedRowKeys: [allLanguages.find((item) => item.default)?.id],
          type: 'radio',
          onChange: (values) => {
            if (isDemo) {
              demoFunc();
              return;
            }
            setIsModalVisible(true);
            setId(values[0]);
            setType(true);
          },
        }}
      />
      <CustomModal
        click={type === 'deleteLang' ? deleteLang : setDefaultLang}
        text={
          type !== 'deleteLang'
            ? t('change.default.language')
            : t('confirm.delete.selection')
        }
        loading={loadingBtn}
      />
    </Card>
  );
};

export default Languages;

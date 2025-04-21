import {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  createContext,
} from 'react';
import {
  Button,
  Col,
  Divider,
  Form,
  Input,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import translationService from 'services/translation';
import { toast } from 'react-toastify';
import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import TranslationCreateModal from './translationCreateModal';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CgExport, CgImport } from 'react-icons/cg';
import { addMenu } from 'redux/slices/menu';
import { useNavigate } from 'react-router-dom';
import { export_url } from 'configs/app-global';
import Card from 'components/card';
import OutlinedButton from 'components/outlined-button';
import SearchInput from 'components/search-input';
import useDidUpdate from '../../helpers/useDidUpdate';

const EditableContext = createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values, dataIndex });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            validator(_, value) {
              if (!value) {
                return Promise.reject(new Error(t('required')));
              } else if (value && value?.trim() === '') {
                return Promise.reject(new Error(t('no.empty.space')));
              } else if (value && value?.trim().length < 2) {
                return Promise.reject(new Error(t('must.be.at.least.2')));
              }
              return Promise.resolve();
            },
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className='editable-cell-value-wrap cursor-pointer d-flex justify-content-between align-items-center'
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        <div className='w-100'>{children}</div>
        <EditOutlined />
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default function Translations() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { activeMenu } = useSelector((state) => state.menu, shallowEqual);
  const [list, setList] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [group, setGroup] = useState(null);
  const [sort, setSort] = useState(null);
  const [column, setColumn] = useState(null);
  const [visible, setVisible] = useState(false);
  const [skipPage, setSkipPage] = useState(0);
  const { languages } = useSelector((state) => state.formLang, shallowEqual);
  const [locale, setLocale] = useState('');
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState(false);

  const defaultColumns = useMemo(
    () => [
      {
        title: t('name'),
        dataIndex: 'key',
        sorter: (a, b, sortOrder) => sortTable(sortOrder, 'key'),
        width: 250,
        fixed: 'left',
      },
      {
        title: t('group'),
        dataIndex: 'group',
        sorter: (a, b, sortOrder) => sortTable(sortOrder, 'group'),
        width: 150,
        fixed: 'left',
      },
      ...languages
        .filter((item) => (locale ? item.locale === locale : true))
        .map((item) => ({
          title: item.title,
          dataIndex: `value[${item.locale}]`,
          editable: true,
          width: 300,
        })),
    ],
    // eslint-disable-next-line
    [languages, locale],
  );

  function sortTable(type, column) {
    let sortType;
    switch (type) {
      case 'ascend':
        sortType = 'asc';
        break;
      case 'descend':
        sortType = 'desc';
        break;

      default:
        break;
    }
    setSort(sortType);
    setColumn(column);
  }

  function fetchTranslations() {
    setLoading(true);
    const params = {
      perPage: pageSize,
      skip: skipPage,
      group,
      sort,
      column,
      search,
    };
    translationService
      .getAll(params)
      .then(({ data }) => {
        const translations = Object.entries(data.translations).map((item) => ({
          key: item[0],
          group: item[1][0].group,
          ...Object.assign(
            {},
            ...languages.map((lang) => ({
              [`value[${lang?.locale}]`]: item[1].find(
                (el) => el?.locale === lang?.locale,
              )?.value,
            })),
          ),
        }));
        setList(translations);
        setTotal(data?.total);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchTranslations();
    // eslint-disable-next-line
  }, [languages]);

  useDidUpdate(() => {
    fetchTranslations();
  }, [pageSize, group, sort, column, skipPage, search]);

  useDidUpdate(() => {
    if (activeMenu.refetch) {
      fetchTranslations();
    }
  }, [activeMenu.refetch]);

  const onChangePagination = (pageNumber) => {
    const { pageSize, current } = pageNumber;
    const skip = (current - 1) * pageSize;
    setPageSize(pageSize);
    setPage(current);
    setSkipPage(skip);
  };

  const handleSave = (row) => {
    const { dataIndex, key } = row;
    const newData = [...list];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    if (item[dataIndex] === row[dataIndex]) {
      return;
    }
    newData.splice(index, 1, { ...item, ...row });
    setList(newData);
    const savedItem = {
      ...row,
      value: undefined,
      dataIndex: undefined,
      key: undefined,
    };
    updateTranslation(key, savedItem);
  };

  function updateTranslation(key, data) {
    translationService
      .update(key, data)
      .then((res) => toast.success(res.message));
  }

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        fixed: col.fixed,
        handleSave,
      }),
    };
  });

  const excelExport = () => {
    setDownloading(true);
    translationService
      .export()
      .then((res) => {
        window.location.href = export_url + res.data.file_name;
      })
      .finally(() => setDownloading(false));
  };

  const goToImport = () => {
    dispatch(
      addMenu({
        id: 'translation-import',
        url: `settings/translations/import`,
        name: t('translation.import'),
      }),
    );
    navigate(`import`);
  };

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
          {t('translations')}
        </Typography.Title>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => setVisible(true)}
          style={{ width: '100%' }}
        >
          {t('add.translation')}
        </Button>
      </Space>
      <Divider color='var(--divider)' />
      <Space
        className='w-100 justify-content-end align-items-center'
        wrap
        style={{ rowGap: '6px', columnGap: '6px' }}
      >
        <Col style={{ minWidth: '228px' }}>
          <SearchInput
            placeholder={t('search.by.key.and.title')}
            className='w-100'
            handleChange={(search) => setSearch(search)}
            resetSearch={!search}
            defaultValue={search}
          />
        </Col>
        <Select
          style={{ minWidth: 200 }}
          value={locale}
          onChange={(value) => setLocale(value)}
          placeholder={t('select.language')}
        >
          <Select.Option value=''>{t('all')}</Select.Option>
          {languages.map((item) => (
            <Select.Option key={item.locale} value={item.locale}>
              {item.title}
            </Select.Option>
          ))}
        </Select>
        <Select
          style={{ minWidth: 200 }}
          value={group}
          onChange={(value) => setGroup(value)}
          placeholder={t('select.group')}
        >
          <Select.Option value=''>{t('all')}</Select.Option>
          <Select.Option value='web'>{t('web')}</Select.Option>
          <Select.Option value='mobile'>{t('mobile')}</Select.Option>
          <Select.Option value='errors'>{t('errors')}</Select.Option>
        </Select>
        <OutlinedButton onClick={excelExport} loading={downloading}>
          <CgExport />
          {t('export')}
        </OutlinedButton>
        <OutlinedButton onClick={goToImport} color='green'>
          <CgImport />
          {t('import')}
        </OutlinedButton>
      </Space>
      <Divider color='var(--divider)' />
      <Table
        components={components}
        columns={columns}
        dataSource={list}
        pagination={{
          pageSize,
          page,
          total,
        }}
        rowKey={(record) => record.id}
        onChange={onChangePagination}
        loading={loading}
        scroll={{
          x: 1500,
        }}
      />
      {visible && (
        <TranslationCreateModal
          visible={visible}
          setVisible={setVisible}
          languages={languages}
          refetch={fetchTranslations}
        />
      )}
    </Card>
  );
}

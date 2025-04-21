import cls from './filter.module.scss';
import { useTranslation } from 'react-i18next';
import { Select } from 'antd';

const perPageOptions = [5, 10, 50, 100];

const DashboardFilter = ({
  filterList,
  activeKey,
  onChange,
  disabled = false,
  withPerPage = false,
  activeKeyPerPage = 5,
  onChangePerPage,
}) => {
  const { t } = useTranslation();
  return (
    <div className={cls.container}>
      {withPerPage && (
        <div className={cls.perPageContainer}>
          <Select
            onChange={onChangePerPage}
            value={activeKeyPerPage}
            className='w-100'
            options={perPageOptions.map((item) => ({
              label: `${item} / ${t('page')}`,
              value: item,
              key: item,
            }))}
          />
        </div>
      )}
      <div className={cls.list}>
        {filterList.map((item) => (
          <button
            type='button'
            key={item}
            onClick={() => onChange(item)}
            className={`${cls.item} ${activeKey === item && cls.active}`}
            disabled={disabled}
          >
            {t(item)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DashboardFilter;

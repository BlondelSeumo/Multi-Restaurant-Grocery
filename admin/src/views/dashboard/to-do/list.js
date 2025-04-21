import { FiTrash2 } from 'react-icons/fi';
import cls from './list.module.scss';
import { FaCheck } from 'react-icons/fa6';

const ToDoList = ({ data, onChange, onDelete }) => {
  return (
    <div className={cls.container}>
      {data?.map((item) => (
        <div key={item?.id} className={cls.item}>
          <div className={cls.main}>
            <button
              type='button'
              className={`${cls.checkbox} ${Boolean(item?.isComplete) && cls.checked}`}
              onClick={() => onChange(item?.id)}
            >
              {Boolean(item?.isComplete) && <FaCheck />}
            </button>
            <span className={cls.text}>{item?.name}</span>
          </div>
          <button
            type='button'
            className={cls.delete}
            onClick={() => onDelete(item?.id)}
          >
            <FiTrash2 />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToDoList;

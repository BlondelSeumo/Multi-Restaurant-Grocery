import { useTranslation } from 'react-i18next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { addTodo, changeStatus, removeTodo } from 'redux/slices/todo';
import ToDoList from './list';
import cls from './to-do.module.scss';
import ToDoForm from './form';

const ToDo = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { todos } = useSelector((state) => state.todo, shallowEqual);
  const completedTodos = todos?.reduce(
    (total, item) => (total += item?.isComplete ? 0 : 1),
    0,
  );

  const handleSubmitForm = (values) => {
    dispatch(addTodo(values));
  };

  const handleToggleStatus = (id) => {
    dispatch(changeStatus(id));
  };

  const handleRemoveTodo = (id) => {
    dispatch(removeTodo(id));
  };

  return (
    <div className={cls.container}>
      <h3 className={cls.title}>{t('to-do.list')}</h3>
      <ToDoForm onSubmit={handleSubmitForm} />
      <div>
        {todos.length ? (
          <div className={cls.totalNumber}>
            {completedTodos} {t('of')} {todos.length} {t('remaining')}
          </div>
        ) : (
          <div className={cls.totalNumber}>{t('no.todo')}</div>
        )}
      </div>
      <ToDoList
        data={todos}
        onChange={handleToggleStatus}
        onDelete={handleRemoveTodo}
      />
    </div>
  );
};

export default ToDo;

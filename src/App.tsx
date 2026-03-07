/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Filter as Filters, Todo as Todos } from './types/Todo';
import { TodoApp } from './components/TodoApp/todoapp';
import { Todo } from './components/Todo/todo';
import { Filter } from './components/Filter/filter';
export const App: React.FC = () => {
  const [posts, setPosts] = useState<Todos[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filters>(Filters.all);
  const [errorMessage, setErrorMessage] = useState('');
  const hasTodos = posts.length > 0;
  const [tempTodo, setTempTodo] = useState<Todos | null>(null);
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const setIsUpdatingFor = (id: number, value: boolean) =>
    setUpdatingIds(prev => {
      if (value) {
        return prev.includes(id) ? prev : [...prev, id];
      }

      return prev.filter(x => x !== id);
    });

  useEffect(() => {
    setErrorMessage('');
    setLoading(true);
    getTodos()
      .then(setPosts)
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(''), 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>
      <div className="todoapp__content">
        <TodoApp
          setIsUpdatingFor={setIsUpdatingFor}
          updatingIds={updatingIds}
          setLoading={setLoading}
          posts={posts}
          setPosts={setPosts}
          setErrorMessage={setErrorMessage}
          loading={loading}
          setTempTodo={setTempTodo}
          isUpdating={isUpdating}
        />
        {hasTodos && (
          <>
            <Todo
              posts={posts}
              setErrorMessage={setErrorMessage}
              setPosts={setPosts}
              filter={filter}
              tempTodo={tempTodo}
              setLoading={setLoading}
              loading={loading}
              setIsUpdatingFor={setIsUpdatingFor}
              updatingIds={updatingIds}
              isUpdating={isUpdating}
              setIsUpdating={setIsUpdating}
            />
            <Filter
              setErrorMessage={setErrorMessage}
              posts={posts}
              filter={filter}
              setPosts={setPosts}
              setFilter={setFilter}
              setLoading={setLoading}
            />
          </>
        )}
      </div>
      <div
        data-cy="ErrorNotification"
        className={`notification is-danger is-light has-text-weight-normal ${!errorMessage ? 'hidden' : ''}`}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          onClick={() => setErrorMessage('')}
          className="delete"
        />
        <div
          className={`notification is-danger is-light has-text-weight-normal ${errorMessage ? '' : 'hidden'}`}
        >
          {errorMessage}
        </div>
      </div>
    </div>
  );
};

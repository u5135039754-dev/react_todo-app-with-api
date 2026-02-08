/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, USER_ID } from './api/todos';
import { Filter as Filters, Todo as Todos } from './types/Todo';

import { TodoApp } from './components/TodoApp/todoapp';
import { Todo } from './components/Todo/todo';
import { Filter } from './components/Filter/filter';
import { ErrorNotification } from './components/index/index';

export const App: React.FC = () => {
  const [posts, setPosts] = useState<Todos[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<Filters>(Filters.all);
  const [tempTodo, setTempTodo] = useState<Todos | null>(null);
  const isTemp = useState<boolean | undefined>(undefined);

  const [errorMessage, setErrorMessage] = useState('');
  const hasTodos = posts.length > 0;

  useEffect(() => {
    setErrorMessage('');
    setLoading(true);
    getTodos()
      .then(setPosts)
      .catch(() => setErrorMessage('Unable to load todos'))
      .finally(() => setLoading(false));
  }, []);

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <TodoApp
          posts={posts}
          setPosts={setPosts}
          setErrorMessage={setErrorMessage}
          loading={loading}
          setTempTodo={setTempTodo}
        />

        {hasTodos && (
          <>
            <Todo
              posts={posts}
              setErrorMessage={setErrorMessage}
              setPosts={setPosts}
              filter={filter}
              tempTodo={tempTodo}
              isTemp={isTemp}
            />
            <Filter
              setErrorMessage={setErrorMessage}
              posts={posts}
              filter={filter}
              setPosts={setPosts}
              setFilter={setFilter}
            />
          </>
        )}
      </div>
      <ErrorNotification
        errorMessage={errorMessage}
        setLoading={setLoading}
        setErrorMessage={setErrorMessage}
        posts={posts}
      />
    </div>
  );
};

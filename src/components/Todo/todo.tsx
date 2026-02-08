/* eslint-disable jsx-a11y/label-has-associated-control */
import '../../styles/todo.scss';
import { Filter, Todo as Todos } from '../../types/Todo';
import { TodoItem } from '../TodoItem/todoItem';

type Props = {
  posts: Todos[];
  tempTodo: Todos | null;
  filter: Filter | undefined;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setPosts: React.Dispatch<React.SetStateAction<Todos[]>>;
  isTemp?: [
    boolean | undefined,
    React.Dispatch<React.SetStateAction<boolean | undefined>>,
  ];
};

export const Todo: React.FC<Props> = ({
  posts,
  filter,
  setErrorMessage,
  setPosts,
  tempTodo,
  isTemp,
}) => {
  const visibleTodos = posts.filter(todo => {
    if (filter === 'active') {
      return !todo.completed;
    }

    if (filter === 'completed') {
      return todo.completed;
    }

    return true;
  });

  return (
    <section className="todoapp__main" data-cy="TodoList">
      {visibleTodos.map(post => (
        <TodoItem
          key={post.id}
          post={post}
          setErrorMessage={setErrorMessage}
          setPosts={setPosts}
          isTemp={isTemp}
        />
      ))}
      {tempTodo && (
        <TodoItem
          key="temp"
          post={tempTodo}
          setErrorMessage={setErrorMessage}
          setPosts={setPosts}
          isTemp={isTemp}
        />
      )}
      {/* Render tempTodo after the list */}
      {tempTodo && (
        <div data-cy="Todo" key={0} className="todo">
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={tempTodo.completed}
              disabled
            />
          </label>
          <span data-cy="TodoTitle" className="todo__title">
            {tempTodo.title}
          </span>
          <button
            type="button"
            aria-label="Delete todo"
            className="todo__remove"
            data-cy="TodoDelete"
            disabled
          >
            ×
          </button>
          {tempTodo && (
            <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

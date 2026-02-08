import '../../styles/todoapp.scss';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import * as postService from '../../api/todos';
import { USER_ID } from '../../api/todos';
import { ItemType, Todo } from '../../types/Todo';

type Props = {
  posts: Todo[];
  setPosts: Dispatch<SetStateAction<Todo[]>>;
  loading: boolean;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setTempTodo: React.Dispatch<React.SetStateAction<Todo | null>>;
};

export const TodoApp: React.FC<Props> = ({
  posts,
  setPosts,
  loading,
  setErrorMessage,
  setTempTodo,
}) => {
  const [title, setTitle] = useState('');
  const isTitleEmpty = title.trim() === '';
  const allCompleted = posts.length > 0 && posts.every(post => post.completed);
  const hasPosts = posts.length > 0;
  const [items, setItems] = useState<ItemType[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCreating, setIsCreating] = useState(false);

  function handleToggleAll() {
    const allChecked = items.every(i => i.checked);
    const newItems = items.map(i => ({ ...i, checked: !allChecked }));

    if (items.length === 0) {
      return;
    }

    if (items.every(i => i.checked === !!items.every(item => item.checked))) {
      return;
    }

    setItems(newItems);
  }

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  async function handleAddPost(event: React.FormEvent) {
    setIsCreating(true);
    event.preventDefault();
    const value = title.trim();
    const newTempTodo: Todo = {
      id: -1,
      title: value,
      completed: false,
    };

    setTempTodo(newTempTodo);

    if (!value) {
      setErrorMessage('Title should not be empty');
      setIsCreating(false);

      return;
    }

    setErrorMessage('');

    setTempTodo(newTempTodo);
    setPosts(current => [...current, newTempTodo]);
    try {
      const newTodo = await postService.createTodo(value, USER_ID);

      setPosts(current =>
        current.map(todo => (todo.id === -1 ? newTodo : todo)),
      );
      setTempTodo(null);
      setTitle(''); // <-- Only clear on success
    } catch {
      setPosts(current => current.filter(todo => todo.id !== -1));
      setTempTodo(null);
      setErrorMessage('Unable to add a todo');
      // Do NOT clear title here
    } finally {
      setIsCreating(false);
      setTempTodo(null);
      inputRef.current?.focus();
    }
  }

  return (
    <header className="todoapp__header">
      {hasPosts && allCompleted ? (
        hasPosts && !allCompleted ? (
          <button
            type="button"
            disabled={isTitleEmpty || loading}
            onClick={handleToggleAll}
            className="todoapp__toggle-all"
            data-cy="ToggleAllButton"
          />
        ) : (
          <button
            type="button"
            disabled={isTitleEmpty || loading}
            onClick={handleToggleAll}
            className="todoapp__toggle-all active"
            data-cy="ToggleAllButton"
          />
        )
      ) : null}

      <form onSubmit={handleAddPost}>
        <input
          data-cy="NewTodoField"
          type="text"
          disabled={isCreating}
          value={title}
          onChange={event => setTitle(event.target.value)}
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
          ref={inputRef}
        />
      </form>
    </header>
  );
};

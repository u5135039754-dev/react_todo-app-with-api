import '../../styles/todoapp.scss';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import * as postService from '../../api/todos';
import { USER_ID } from '../../api/todos';
import { Todo } from '../../types/Todo';
import React from 'react';

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
  // const isTitleEmpty = title.trim() === '';
  const allCompleted = posts.length > 0 && posts.every(post => post.completed);
  const hasPosts = posts.length > 0;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const prevTodosCount = useRef(posts.length);

  useEffect(() => {
    if (posts.length < prevTodosCount.current && inputRef.current) {
      inputRef.current.focus();
    }

    prevTodosCount.current = posts.length;
  }, [posts]);

  const [isAdding, setIsAdding] = useState(false);

  async function handleAddPost(event: React.FormEvent) {
    event.preventDefault();
    const value = title.trim();

    if (!value) {
      setErrorMessage('Title should not be empty');

      return;
    }

    setErrorMessage('');
    setIsAdding(true);
    setTempTodo({
      id: 0,
      title: value,
      completed: false,
      userId: USER_ID,
    });
    try {
      const newTodo = await postService.createTodo(value, USER_ID);

      setPosts(current => [...current, newTodo]);
      setTitle('');
    } catch {
      setErrorMessage('Unable to add a todo');
    } finally {
      setIsAdding(false);
      setTempTodo(null);
    }
  }

  const handleToggleAll = async () => {
    const shouldCompleteAll = !posts.every(todo => todo.completed);
    const updatePromises = posts
      .filter(todo => todo.completed !== shouldCompleteAll)
      .map(todo =>
        postService.updateTodo(todo.id, { completed: shouldCompleteAll }),
      );

    try {
      const updatedTodos = await Promise.all(updatePromises);

      setPosts(post =>
        post.map(
          todos =>
            updatedTodos.find(updated => updated.id === todos.id) || todos,
        ),
      );
    } catch {
      setErrorMessage('Unable to update a todo');
    }
  };

  useEffect(() => {
    if (!loading && !isAdding) {
      inputRef.current?.focus();
    }
  }, [loading, isAdding]);

  return (
    <header className="todoapp__header">
      {hasPosts && (
        <button
          type="button"
          disabled={loading}
          onClick={handleToggleAll}
          className={`todoapp__toggle-all${allCompleted ? ' active' : ''}`}
          data-cy="ToggleAllButton"
        />
      )}

      <form onSubmit={handleAddPost}>
        <input
          data-cy="NewTodoField"
          type="text"
          ref={inputRef}
          value={title || ''}
          onChange={event => setTitle(event.target.value)}
          disabled={isAdding || loading}
          className="todoapp__new-todo"
          placeholder="What needs to be done?"
        />
      </form>
    </header>
  );
};

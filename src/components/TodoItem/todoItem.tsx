/* eslint-disable jsx-a11y/label-has-associated-control */
import classNames from 'classnames';
import '../../styles/todo.scss';
import { Todo as Todos } from '../../types/Todo';
import { useState } from 'react';
import * as postService from '../../api/todos';

type Props = {
  post: Todos;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setPosts: React.Dispatch<React.SetStateAction<Todos[]>>;
  isTemp?: [
    boolean | undefined,
    React.Dispatch<React.SetStateAction<boolean | undefined>>,
  ];
};

export const TodoItem: React.FC<Props> = ({
  post,
  setErrorMessage,
  setPosts,
  isTemp,
}) => {
  const [updatingIds, setUpdatingIds] = useState<number[]>([]);

  const handleTodoStatus = async (id: number, checked: boolean) => {
    setUpdatingIds(prev => [...prev, id]);
    setErrorMessage('');
    try {
      const updated = await postService.updateTodo(id, { completed: checked });

      setPosts(posts => posts.map(todo => (todo.id === id ? updated : todo)));
    } catch {
      setErrorMessage('Unable to update a todo');
    } finally {
      setUpdatingIds(prev => prev.filter(tid => tid !== id));
    }
  };

  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const onDelete = async (postId: number) => {
    setDeletingTodoId(postId);
    try {
      await postService.deletePost(postId);
      setPosts(currentPosts =>
        currentPosts.filter(posts => posts.id !== postId),
      );
    } catch (error) {
      setErrorMessage('Unable to delete todo');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setDeletingTodoId(null);
    }
  };

  return (
    <div
      data-cy="Todo"
      className={classNames('todo', { completed: post.completed })}
    >
      <label className="todo__status-label" htmlFor="todoStatus">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          id="todoStatus"
          className="todo__status"
          onChange={event => handleTodoStatus(post.id, event.target.checked)}
          checked={post.completed}
          disabled={updatingIds.includes(post.id)}
        />
      </label>
      <span data-cy="TodoTitle" className="todo__title">
        {post.title}
      </span>
      <button
        type="button"
        aria-label="Delete todo"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={() => onDelete(post.id)}
        disabled={deletingTodoId === post.id}
      >
        ×
      </button>
      {isTemp && (
        <div data-cy="TodoLoader" className="modal overlay">
          <div className="modal-background has-background-white-ter" />
          <div className="loader" />
        </div>
      )}
    </div>
  );
};

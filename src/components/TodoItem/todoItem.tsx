/* eslint-disable jsx-a11y/label-has-associated-control */
import '../../styles/todo.scss';
import * as postService from '../../api/todos';
import { Filter, Todo as Todos } from '../../types/Todo';
import { useState } from 'react';
import React from 'react';
import classNames from 'classnames';
import { TodoList } from '../TodoList/TodoList';
type Props = {
  posts: Todos[];
  todo: Todos;
  filter: Filter | undefined;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setPosts: React.Dispatch<React.SetStateAction<Todos[]>>;
  loading: boolean;
  updatingIds: number[];
  setUpdatingIds: React.Dispatch<React.SetStateAction<number[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};
export const TodoItem: React.FC<Props> = ({
  posts,
  filter,
  todo,
  setErrorMessage,
  setUpdatingIds,
  setPosts,
  updatingIds,
  loading,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const visibleTodos = posts.filter(todos => {
    if (filter === 'active') {
      return !todos.completed;
    }

    if (filter === 'completed') {
      return todos.completed;
    }

    return true;
  });

  async function handleTodoStatus(id: number, checked: boolean) {
    setErrorMessage('');
    setUpdatingIds(prev => [...prev, id]);
    try {
      const current = posts.find(post => post.id === id);

      if (!current) {
        return;
      }

      const serverTodo = await postService.updateTodo(id, {
        completed: checked,
      });

      setPosts(prev => prev.map(post => (post.id === id ? serverTodo : post)));
    } catch (error) {
      setErrorMessage('Unable to update a todo');
    } finally {
      setUpdatingIds(prev => prev.filter(updatingId => updatingId !== id));
    }
  }

  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const onDelete = async (postId: number) => {
    setDeletingTodoId(postId);
    try {
      await postService.deletePost(postId);
      setPosts(currentPosts => currentPosts.filter(post => post.id !== postId));
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setDeletingTodoId(null);
    }
  };

  return (
    <div>
      {visibleTodos.map(post => (
        <div
          key={post.id}
          data-cy="Todo"
          className={classNames('todo', { completed: post.completed })}
        >
          <label
            className="todo__status-label"
            htmlFor={`todoStatus-${post.id}`}
          >
            <input
              data-cy="TodoStatus"
              type="checkbox"
              id={`todoStatus-${post.id}`}
              className="todo__status"
              onChange={event =>
                handleTodoStatus(post.id, event.target.checked)
              }
              checked={post.completed}
              disabled={updatingIds.includes(post.id)}
            />
          </label>

          {isEditing ? (
            <TodoList
              onDelete={onDelete}
              todo={todo}
              setErrorMessage={setErrorMessage}
              setPosts={setPosts}
              setIsEditing={setIsEditing}
            />
          ) : (
            <span
              data-cy="TodoTitle"
              onDoubleClick={() => setIsEditing(true)}
              className="todo__title"
            >
              {post.title}
            </span>
          )}
          <button
            type="button"
            aria-label="Delete todo"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => onDelete(post.id)}
            disabled={deletingTodoId === post.id && isEditing}
          >
            ×
          </button>
          {deletingTodoId === post.id && (
            <div
              data-cy="TodoLoader"
              className={classNames('modal overlay', {
                'is-active': updatingIds,
              })}
            >
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          )}
          <div
            data-cy="TodoLoader"
            className={classNames('modal overlay', {
              'is-active': updatingIds.includes(post.id),
            })}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>

          {loading && (
            <div
              data-cy="TodoLoader"
              className={classNames('modal overlay is-active')}
            >
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

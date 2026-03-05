/* eslint-disable jsx-a11y/label-has-associated-control */
import '../../styles/todo.scss';
import * as postService from '../../api/todos';
import { Filter, Todo as Todos } from '../../types/Todo';
import { useState } from 'react';
import React from 'react';
import { TaskItem } from '../TaskItem/TaskItem';
type Props = {
  posts: Todos[];
  filter: Filter | undefined;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setPosts: React.Dispatch<React.SetStateAction<Todos[]>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};
export const TodoItem: React.FC<Props> = ({
  posts,
  filter,
  setErrorMessage,
  setPosts,
}) => {
  const visibleTodos = posts.filter(todos => {
    if (filter === 'completed') {
      return todos.completed;
    }

    if (filter === 'active') {
      return !todos.completed;
    }

    return true;
  });

  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const onDelete = async (postId: number) => {
    setDeletingTodoId(postId);
    try {
      await postService.deletePost(postId);
      setPosts(currentPosts => currentPosts.filter(pos => pos.id !== postId));
    } catch (error) {
      setErrorMessage('Unable to delete a todo');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setDeletingTodoId(null);
    }
  };

  async function handleTodoStatus(id: number, checked: boolean) {
    setErrorMessage('');
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
    }
  }

  return (
    <div>
      {visibleTodos.map(post => (
        <TaskItem
          post={post}
          key={post.id}
          handleTodoStatus={handleTodoStatus}
          onDelete={onDelete}
          deletingTodoId={deletingTodoId}
          setErrorMessage={setErrorMessage}
          setPosts={setPosts}
        />
      ))}
    </div>
  );
};

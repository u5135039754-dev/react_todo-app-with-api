import { useState } from 'react';
import { Todo as Todos } from '../../types/Todo';
import * as postService from '../../api/todos';

type Props = {
  todo: Todos;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setPosts: React.Dispatch<React.SetStateAction<Todos[]>>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  onDelete: (postId: number) => Promise<void>;
};

export const TodoList: React.FC<Props> = ({
  todo,
  setErrorMessage,
  setPosts,
  setIsEditing,
  onDelete,
}) => {
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [isUpdating, setIsUpdating] = useState(false);
  const handleEdit = async () => {
    if (isUpdating) {
      return;
    } // захист від повторного виклику

    const trimmed = editedTitle.trim();

    if (trimmed === '') {
      await onDelete(todo.id);
      setIsEditing(false);
      setErrorMessage('');

      return;
    }

    if (trimmed === todo.title) {
      setIsEditing(false);

      return;
    }

    setIsUpdating(true);
    try {
      const updated = await postService.updateTodo(todo.id, { title: trimmed });

      setPosts(posts => posts.map(t => (t.id === todo.id ? updated : t)));
      setIsEditing(false);
    } catch {
      setErrorMessage('Unable to update a todo');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <input
      data-cy="TodoTitleField"
      value={editedTitle}
      onChange={event => setEditedTitle(event.target.value)}
      onBlur={() => {
        if (!isUpdating) {
          handleEdit();
        }
      }}
      onKeyDown={event => {
        if (event.key === 'Enter') {
          handleEdit();
        }

        if (event.key === 'Escape') {
          setIsEditing(false);
          setErrorMessage('');
        }
      }}
      autoFocus
    />
  );
};

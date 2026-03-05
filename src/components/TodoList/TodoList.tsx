/* eslint-disable jsx-a11y/label-has-associated-control */
import { useState } from 'react';
import { Todo as Todos } from '../../types/Todo';
import * as postService from '../../api/todos';
import classNames from 'classnames';

type Props = {
  todo: Todos;
  setErrorMessage: React.Dispatch<React.SetStateAction<string>>;
  setPosts: React.Dispatch<React.SetStateAction<Todos[]>>;
  onDelete: (postId: number) => Promise<void>;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
};

export const TodoList: React.FC<Props> = ({
  todo,
  setErrorMessage,
  setPosts,
  onDelete,
  setIsEditing,
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

      setPosts(po => po.map(t => (t.id === todo.id ? updated : t)));
      setIsEditing(false);
    } catch {
      setErrorMessage('Unable to update a todo');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
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
      {isUpdating && (
        <div data-cy="TodoLoader" className={classNames('modal overlay')}>
          <div className="modal-background has-background-white-ter" />
          <div className="loader" />
        </div>
      )}
    </>
  );
};

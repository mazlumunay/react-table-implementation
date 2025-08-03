import React, { useState, useMemo, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { dataService } from '../services/dataService';
import './UserTable.css';

const ItemType = 'COLUMN';

// Draggable column header component
const DraggableColumnHeader = ({ column, index, moveColumn, onSort, sortConfig }) => {
  const [, drag] = useDrag({
    type: ItemType,
    item: { index },
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveColumn(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const getSortIcon = () => {
    if (sortConfig.key === column.key) {
      return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <th
      ref={(node) => drag(drop(node))}
      className="draggable-header"
      onClick={() => onSort(column.key)}
      style={{ cursor: 'move' }}
    >
      {column.label}{getSortIcon()}
    </th>
  );
};

// Table row component for performance
const TableRow = React.memo(({ user, columns }) => (
  <tr>
    {columns.map((column) => (
      <td key={column.key}>
        {column.render ? column.render(user) : user[column.key]}
      </td>
    ))}
  </tr>
));

const UserTable = () => {
  // Initial column configuration
  const initialColumns = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'fullName', label: 'Full Name', render: (user) => user.fullName },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    { key: 'registeredDate', label: 'Registered Date', render: (user) => new Date(user.registeredDate).toLocaleDateString() },
    { key: 'daysSinceRegistered', label: 'DSR', render: (user) => user.daysSinceRegistered },
  ];

  const [columns, setColumns] = useState(initialColumns);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [visibleRows, setVisibleRows] = useState(50); // For simple pagination

  // Get all users data
  const allUsers = useMemo(() => dataService.getUsers(), []);

  // Sort users based on current sort configuration
  const sortedUsers = useMemo(() => {
    return dataService.sortUsers(sortConfig.key, sortConfig.direction);
  }, [sortConfig]);

  // Get visible users for virtual scrolling simulation
  const visibleUsers = useMemo(() => {
    return sortedUsers.slice(0, visibleRows);
  }, [sortedUsers, visibleRows]);

  // Handle column reordering
  const moveColumn = useCallback((fromIndex, toIndex) => {
    const updatedColumns = [...columns];
    const [movedColumn] = updatedColumns.splice(fromIndex, 1);
    updatedColumns.splice(toIndex, 0, movedColumn);
    setColumns(updatedColumns);
  }, [columns]);

  // Handle sorting
  const handleSort = useCallback((key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // Load more rows (simulating virtual scrolling)
  const loadMoreRows = () => {
    setVisibleRows(prev => Math.min(prev + 50, allUsers.length));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="table-container">
        <h2>User Data Table ({allUsers.length} total records)</h2>
        <div className="table-info">
          <p><strong>Features:</strong> Drag columns to reorder • Click headers to sort • Optimized for large datasets</p>
          <p><strong>Currently showing:</strong> {visibleUsers.length} of {sortedUsers.length} records</p>
        </div>
        
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                {columns.map((column, index) => (
                  <DraggableColumnHeader
                    key={column.key}
                    column={column}
                    index={index}
                    moveColumn={moveColumn}
                    onSort={handleSort}
                    sortConfig={sortConfig}
                  />
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <TableRow
                  key={user.id}
                  user={user}
                  columns={columns}
                />
              ))}
            </tbody>
          </table>
        </div>
        
        {visibleRows < sortedUsers.length && (
          <div className="load-more">
            <button onClick={loadMoreRows} className="load-more-btn">
              Load More Rows ({sortedUsers.length - visibleRows} remaining)
            </button>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default UserTable;
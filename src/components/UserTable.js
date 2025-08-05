import React, { useState, useMemo, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { dataService, formatDate } from '../services/dataService';
import './UserTable.css';

const ItemType = 'COLUMN';

// Utility function to download files
const downloadFile = (content, filename, contentType) => {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Search component
const SearchBar = ({ searchTerm, onSearchChange, totalResults, filteredResults }) => (
  <div className="search-bar">
    <div className="search-input-wrapper">
      <input
        type="text"
        placeholder="Search users by name, email, or city..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
        aria-label="Search users"
      />
      <span className="search-icon">🔍</span>
    </div>
    {searchTerm && (
      <div className="search-results-info">
        Found {filteredResults.toLocaleString()} of {totalResults.toLocaleString()} users
        {filteredResults === 0 && (
          <span className="no-results"> - Try a different search term</span>
        )}
      </div>
    )}
  </div>
);

// Export controls component
const ExportControls = ({ onExportCsv, onExportJson, isExporting, filteredCount }) => (
  <div className="export-controls">
    <span className="export-label">Export ({filteredCount.toLocaleString()} records):</span>
    <button
      onClick={onExportCsv}
      disabled={isExporting}
      className="export-btn csv"
      aria-label="Export to CSV"
    >
      {isExporting ? '⏳' : '📊'} CSV
    </button>
    <button
      onClick={onExportJson}
      disabled={isExporting}
      className="export-btn json"
      aria-label="Export to JSON"
    >
      {isExporting ? '⏳' : '📄'} JSON
    </button>
  </div>
);

// Draggable column header component with enhanced accessibility
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
      return (
        <span className={`sort-indicator active`}>
          {sortConfig.direction === 'asc' ? '↑' : '↓'}
        </span>
      );
    }
    return <span className="sort-indicator">↕</span>;
  };

  const getSortAriaSort = () => {
    if (sortConfig.key === column.key) {
      return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
    }
    return 'none';
  };

  return (
    <th
      ref={(node) => drag(drop(node))}
      className="draggable-header"
      onClick={() => onSort(column.key)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(column.key);
        }
      }}
      tabIndex={0}
      role="columnheader"
      aria-sort={getSortAriaSort()}
      aria-label={`${column.label} column, click to sort, drag to reorder`}
      style={{ cursor: 'move' }}
    >
      {column.label}
      {getSortIcon()}
    </th>
  );
};

// Table row component for performance
const TableRow = React.memo(({ user, columns, searchTerm }) => {
  // Highlight search matches
  const highlightText = (text, term) => {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.toString().split(regex);
    return parts.map((part, index) => 
      regex.test(part) ? <mark key={index} className="search-highlight">{part}</mark> : part
    );
  };

  return (
    <tr>
      {columns.map((column) => {
        const cellValue = column.render ? column.render(user) : user[column.key];
        const displayValue = searchTerm && 
          ['firstName', 'lastName', 'fullName', 'email', 'city'].includes(column.key)
          ? highlightText(cellValue, searchTerm)
          : cellValue;
        
        return (
          <td key={column.key}>
            {displayValue}
          </td>
        );
      })}
    </tr>
  );
});

// Loading spinner component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
  </div>
);

const UserTable = () => {
  // Initial column configuration with improved date formatting
  const initialColumns = [
    { key: 'id', label: 'ID' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'fullName', label: 'Full Name', render: (user) => user.fullName },
    { key: 'email', label: 'Email' },
    { key: 'city', label: 'City' },
    { key: 'registeredDate', label: 'Registered Date', render: (user) => formatDate(user.registeredDate) },
    { key: 'daysSinceRegistered', label: 'DSR', render: (user) => user.daysSinceRegistered },
  ];

  const [columns, setColumns] = useState(initialColumns);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [visibleRows, setVisibleRows] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get all users data
  const allUsers = useMemo(() => dataService.getUsers(), []);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return allUsers;
    return dataService.searchUsers(searchTerm);
  }, [allUsers, searchTerm]);

  // Sort filtered users based on current sort configuration
  const sortedUsers = useMemo(() => {
    return dataService.sortUsers(sortConfig.key, sortConfig.direction, filteredUsers);
  }, [sortConfig, filteredUsers]);

  // Get visible users for pagination
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

  // Handle sorting with loading state
  const handleSort = useCallback(async (key) => {
    setIsSorting(true);
    // Simulate async sorting for large datasets
    await new Promise(resolve => setTimeout(resolve, 150));
    
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc',
    }));
    
    setIsSorting(false);
  }, []);

  // Handle search with debouncing effect
  const handleSearchChange = useCallback((term) => {
    setSearchTerm(term);
    setVisibleRows(50); // Reset pagination when searching
  }, []);

  // Load more rows with loading state
  const loadMoreRows = async () => {
    setIsLoading(true);
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));
    setVisibleRows(prev => Math.min(prev + 50, sortedUsers.length));
    setIsLoading(false);
  };

  // Export functions
  const exportToCsv = async () => {
    setIsExporting(true);
    try {
      // Use filtered users for export
      const csvData = dataService.exportUsers('csv', filteredUsers);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = searchTerm 
        ? `users-search-${searchTerm.slice(0, 10)}-${timestamp}.csv`
        : `users-${timestamp}.csv`;
      downloadFile(csvData, filename, 'text/csv');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  const exportToJson = async () => {
    setIsExporting(true);
    try {
      // Use filtered users for export
      const jsonData = dataService.exportUsers('json', filteredUsers);
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = searchTerm 
        ? `users-search-${searchTerm.slice(0, 10)}-${timestamp}.json`
        : `users-${timestamp}.json`;
      downloadFile(jsonData, filename, 'application/json');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setTimeout(() => setIsExporting(false), 500);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="table-container">
        <div className="table-header">
          <h2>User Data Table ({allUsers.length.toLocaleString()} total records)</h2>
          <div className="table-controls">
            <SearchBar 
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              totalResults={allUsers.length}
              filteredResults={filteredUsers.length}
            />
            <ExportControls 
              onExportCsv={exportToCsv}
              onExportJson={exportToJson}
              isExporting={isExporting}
              filteredCount={filteredUsers.length}
            />
          </div>
        </div>

        <div className="table-info">
          <p><strong>Features:</strong> Search • Sort • Drag columns • Export data • Optimized for large datasets</p>
          <p><strong>Currently showing:</strong> {visibleUsers.length.toLocaleString()} of {sortedUsers.length.toLocaleString()} records</p>
          {isSorting && <p className="sorting-indicator"><strong>Sorting...</strong></p>}
        </div>
        
        <div className="table-wrapper">
          <table className="user-table" role="table" aria-label="User data table">
            <thead>
              <tr role="row">
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
                  searchTerm={searchTerm}
                />
              ))}
            </tbody>
          </table>
          
          {isSorting && (
            <div className="table-overlay">
              <LoadingSpinner />
            </div>
          )}

          {filteredUsers.length === 0 && searchTerm && (
            <div className="no-results-message">
              <p>No users found matching "<strong>{searchTerm}</strong>"</p>
              <p>Try searching for names, emails, or cities</p>
            </div>
          )}
        </div>
        
        {visibleRows < sortedUsers.length && (
          <div className="load-more">
            <button 
              onClick={loadMoreRows} 
              className={`load-more-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
              aria-label={`Load more rows, ${sortedUsers.length - visibleRows} remaining`}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Loading...
                </>
              ) : (
                `Load More Rows (${(sortedUsers.length - visibleRows).toLocaleString()} remaining)`
              )}
            </button>
          </div>
        )}
        
        {visibleRows >= sortedUsers.length && sortedUsers.length > 0 && (
          <div className="load-more">
            <p className="all-loaded">✅ All records loaded ({sortedUsers.length.toLocaleString()} total)</p>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

export default UserTable;
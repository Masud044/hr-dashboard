import React, { useState, useMemo } from 'react';
import Timeline, {
  TimelineMarkers,
  TodayMarker,
  CustomMarker,
  CursorMarker,
  TimelineHeaders,
  SidebarHeader,
  DateHeader
} from 'react-calendar-timeline';
// import 'react-calendar-timeline/lib/Timeline.css';
import moment from 'moment';

const ReactTimelineDemo = () => {
  // Define groups (rows in the timeline)
  const groups = useMemo(() => [
    { id: 1, title: 'Development Team' },
    { id: 2, title: 'Design Team' },
    { id: 3, title: 'Marketing Team' },
    { id: 4, title: 'Sales Team' }
  ], []);

  // Define initial items (events/tasks on the timeline)
  const [items, setItems] = useState([
    {
      id: 1,
      group: 1,
      title: 'Sprint Planning',
      start_time: moment().add(-2, 'days'),
      end_time: moment().add(-1, 'days'),
      canMove: true,
      canResize: 'both',
      canChangeGroup: true,
      itemProps: {
        style: {
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }
      }
    },
    {
      id: 2,
      group: 1,
      title: 'Code Review',
      start_time: moment().add(1, 'days'),
      end_time: moment().add(3, 'days'),
      canMove: true,
      canResize: 'both',
      canChangeGroup: true,
      itemProps: {
        style: {
          background: '#8b5cf6',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }
      }
    },
    {
      id: 3,
      group: 2,
      title: 'Design Mockups',
      start_time: moment().add(-3, 'days'),
      end_time: moment().add(2, 'days'),
      canMove: true,
      canResize: 'both',
      canChangeGroup: true,
      itemProps: {
        style: {
          background: '#ec4899',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }
      }
    },
    {
      id: 4,
      group: 2,
      title: 'User Testing',
      start_time: moment().add(4, 'days'),
      end_time: moment().add(6, 'days'),
      canMove: true,
      canResize: 'both',
      canChangeGroup: true,
      itemProps: {
        style: {
          background: '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }
      }
    },
    {
      id: 5,
      group: 3,
      title: 'Campaign Launch',
      start_time: moment().add(-1, 'days'),
      end_time: moment().add(1, 'days'),
      canMove: true,
      canResize: 'both',
      canChangeGroup: true,
      itemProps: {
        style: {
          background: '#10b981',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }
      }
    },
    {
      id: 6,
      group: 4,
      title: 'Client Meeting',
      start_time: moment().add(2, 'days'),
      end_time: moment().add(3, 'days'),
      canMove: true,
      canResize: 'both',
      canChangeGroup: true,
      itemProps: {
        style: {
          background: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }
      }
    },
    {
      id: 7,
      group: 3,
      title: 'Social Media Posts',
      start_time: moment().add(5, 'days'),
      end_time: moment().add(7, 'days'),
      canMove: true,
      canResize: 'both',
      canChangeGroup: true,
      itemProps: {
        style: {
          background: '#06b6d4',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }
      }
    }
  ]);

  const [selectedItems, setSelectedItems] = useState([]);

  // Handle item move
  const handleItemMove = (itemId, dragTime, newGroupOrder) => {
    setItems(prevItems => {
      const itemIndex = prevItems.findIndex(item => item.id === itemId);
      const item = prevItems[itemIndex];
      const duration = item.end_time - item.start_time;
      
      const newItems = [...prevItems];
      newItems[itemIndex] = {
        ...item,
        start_time: dragTime,
        end_time: dragTime + duration,
        group: groups[newGroupOrder].id
      };
      
      return newItems;
    });
  };

  // Handle item resize
  const handleItemResize = (itemId, time, edge) => {
    setItems(prevItems => {
      const itemIndex = prevItems.findIndex(item => item.id === itemId);
      const item = prevItems[itemIndex];
      
      const newItems = [...prevItems];
      if (edge === 'left') {
        newItems[itemIndex] = {
          ...item,
          start_time: time
        };
      } else {
        newItems[itemIndex] = {
          ...item,
          end_time: time
        };
      }
      
      return newItems;
    });
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    setSelectedItems([itemId]);
  };

  // Handle item deselect
  const handleItemDeselect = () => {
    setSelectedItems([]);
  };

  // Handle canvas click (create new item)
  const handleCanvasClick = (groupId, time) => {
    const newItem = {
      id: items.length + 1,
      group: groupId,
      title: `New Task ${items.length + 1}`,
      start_time: time,
      end_time: moment(time).add(1, 'day'),
      canMove: true,
      canResize: 'both',
      canChangeGroup: true,
      itemProps: {
        style: {
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '4px'
        }
      }
    };
    setItems([...items, newItem]);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          React Calendar Timeline Demo
        </h1>
        <p className="text-sm text-gray-600">
          Drag to move tasks, resize from edges, click empty space to create new tasks
        </p>
        <div className="mt-3 flex gap-4 text-xs text-gray-500">
          <span>📅 Scroll horizontally to navigate</span>
          <span>🔍 Shift + Scroll to zoom</span>
          <span>➕ Click empty space to add task</span>
        </div>
      </div>

      {/* Timeline Container */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-white rounded-lg shadow-lg">
          <Timeline
            groups={groups}
            items={items}
            defaultTimeStart={moment().add(-15, 'days')}
            defaultTimeEnd={moment().add(15, 'days')}
            onItemMove={handleItemMove}
            onItemResize={handleItemResize}
            onItemSelect={handleItemSelect}
            onItemDeselect={handleItemDeselect}
            onCanvasClick={handleCanvasClick}
            selected={selectedItems}
            canMove={true}
            canResize="both"
            canChangeGroup={true}
            lineHeight={60}
            itemHeightRatio={0.75}
            sidebarWidth={180}
            stackItems={true}
            buffer={3}
          >
            <TimelineHeaders className="sticky">
              <SidebarHeader>
                {({ getRootProps }) => {
                  return (
                    <div {...getRootProps()} className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      Teams
                    </div>
                  );
                }}
              </SidebarHeader>
              <DateHeader unit="primaryHeader" />
              <DateHeader />
            </TimelineHeaders>

            <TimelineMarkers>
              <TodayMarker>
                {({ styles }) => {
                  const customStyles = {
                    ...styles,
                    backgroundColor: '#ef4444',
                    width: '3px',
                    zIndex: 100
                  };
                  return <div style={customStyles} />;
                }}
              </TodayMarker>
              <CursorMarker>
                {({ styles }) => {
                  const customStyles = {
                    ...styles,
                    backgroundColor: '#3b82f6',
                    width: '2px',
                    opacity: 0.5
                  };
                  return <div style={customStyles} />;
                }}
              </CursorMarker>
            </TimelineMarkers>
          </Timeline>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border-t border-gray-200 p-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Total Tasks: {items.length}</span>
          <span>Selected: {selectedItems.length}</span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded"></span> Current Time Marker
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReactTimelineDemo;
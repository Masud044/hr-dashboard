import React, { useState,  useEffect } from 'react';
import Timeline, {
  TimelineMarkers,
  TodayMarker,
  CursorMarker,
  TimelineHeaders,
  SidebarHeader,
  DateHeader
} from 'react-calendar-timeline';
import moment from 'moment';
import "react-calendar-timeline/style.css";
const ContractorTimelineDemo = () => {
  const [contractors, setContractors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contractors from API
  useEffect(() => {
    const fetchContractors = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://103.172.44.99:8989/api_bwal/contractor_api.php');
        const result = await response.json();
        
        if (result.success && result.data) {
          // Transform API data to timeline groups format
          const groups = result.data.map(contractor => ({
            id: parseInt(contractor.ID),
            title: contractor.NAME
          }));
          setContractors(groups);
          setError(null);
        } else {
          setError('Failed to load contractors');
        }
      } catch (err) {
        setError('Error fetching contractors: ' + err.message);
        // Fallback to sample data
        setContractors([
          { id: 1, title: 'Carpenter' },
          { id: 2, title: 'Mason/Bricklayer' },
          { id: 3, title: 'Concrete Finisher/Cement Mason' },
          { id: 4, title: 'Electrician' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchContractors();
  }, []);

  // Define initial items (tasks assigned to contractors)
  const [items, setItems] = useState([
    {
      id: 1,
      group: 1,
      title: 'Foundation Work',
      start_time: moment().add(-2, 'days'),
      end_time: moment().add(1, 'days'),
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
      group: 4,
      title: 'Electrical Installation',
      start_time: moment().add(2, 'days'),
      end_time: moment().add(5, 'days'),
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
      title: 'Brick Laying',
      start_time: moment().add(-3, 'days'),
      end_time: moment().add(3, 'days'),
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
      group: 5,
      title: 'Plumbing Work',
      start_time: moment().add(4, 'days'),
      end_time: moment().add(7, 'days'),
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
        group: contractors[newGroupOrder].id
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

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading contractors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Contractor Schedule Timeline
        </h1>
        <p className="text-sm text-gray-600">
          Drag to move tasks, resize from edges, click empty space to create new tasks
        </p>
        {error && (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ {error} - Using fallback data
          </div>
        )}
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
            groups={contractors}
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
            sidebarWidth={220}
            stackItems={true}
            buffer={3}
          >
            <TimelineHeaders className="sticky">
              <SidebarHeader>
                {({ getRootProps }) => {
                  return (
                    <div {...getRootProps()} className="flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold">
                      Contractors
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
          <span>Total Contractors: {contractors.length}</span>
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

export default ContractorTimelineDemo;
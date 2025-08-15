# Snap-to-Center Functionality

## Overview
The snap-to-center functionality has been implemented in the image-text-composer editor, allowing users to quickly align selected objects to the center of the canvas workspace.

## Features

### 1. Snap to Center Button
- **Location**: Added to the main toolbar, positioned between the Duplicate and Delete buttons
- **Icon**: Uses the Move icon from Lucide React
- **Tooltip**: Shows "Snap to center (Ctrl+M)" on hover
- **State**: Button is disabled when no objects are selected
- **Visual Feedback**: Button appears dimmed when disabled

### 2. Keyboard Shortcut
- **Shortcut**: `Ctrl+M` (or `Cmd+M` on Mac)
- **Function**: Snaps selected objects to the center of the workspace
- **Availability**: Works whenever objects are selected on the canvas

### 3. Enhanced Snap Functions
- **snapToCenter()**: Centers objects to the workspace center
- **snapToPosition()**: Allows snapping to specific positions:
  - `center`: Center of workspace
  - `left`: Left edge of workspace
  - `right`: Right edge of workspace
  - `top`: Top edge of workspace
  - `bottom`: Bottom edge of workspace

## Implementation Details

### Files Modified
1. **`src/features/editor/types.ts`**
   - Added `snapToCenter: () => void` to Editor interface
   - Added `snapToPosition: (position: 'center' | 'left' | 'right' | 'top' | 'bottom') => void`

2. **`src/features/editor/hooks/use-editor.ts`**
   - Implemented `snapToCenter()` function in buildEditor
   - Implemented `snapToPosition()` function for advanced positioning
   - Added toast notifications for user feedback

3. **`src/features/editor/components/toolbar.tsx`**
   - Added snap-to-center button with Move icon
   - Button is disabled when no objects are selected
   - Added tooltip showing keyboard shortcut

4. **`src/features/editor/hooks/use-hotkeys.ts`**
   - Added `Ctrl+M` shortcut for snap-to-center
   - Extended interface to include snapToCenter function

### How It Works
1. **Object Selection**: User selects one or more objects on the canvas
2. **Snap Action**: User clicks the snap button or presses `Ctrl+M`
3. **Position Calculation**: System calculates the center point of the workspace
4. **Object Repositioning**: Selected objects are moved to the calculated center
5. **Canvas Update**: Canvas is re-rendered and changes are saved
6. **User Feedback**: Toast notification confirms the action

### Error Handling
- **No Selection**: Shows error toast if no objects are selected
- **Workspace Missing**: Shows error if workspace cannot be found
- **Center Calculation**: Shows error if center point cannot be determined
- **Success Feedback**: Shows success toast with count of snapped objects

## Usage Examples

### Basic Usage
1. Select an object on the canvas
2. Click the snap-to-center button (Move icon) in the toolbar
3. Object is automatically centered

### Keyboard Shortcut
1. Select an object on the canvas
2. Press `Ctrl+M` (or `Cmd+M` on Mac)
3. Object is automatically centered

### Multiple Objects
1. Select multiple objects (hold Shift while clicking)
2. Use snap-to-center to center all selected objects
3. All objects maintain their relative positions while being centered as a group

## Technical Notes

### Dependencies
- Uses Fabric.js canvas library
- Integrates with existing toast notification system (Sonner)
- Follows existing code patterns and architecture

### Performance
- Efficient object positioning using Fabric.js built-in methods
- Minimal canvas re-renders
- Automatic save after positioning

### Accessibility
- Button is properly disabled when not applicable
- Clear visual feedback for button states
- Keyboard shortcut support for power users

## Future Enhancements

### Potential Additions
1. **Grid Snapping**: Snap objects to a grid system
2. **Smart Alignment**: Auto-align objects relative to each other
3. **Snap Guidelines**: Visual guides showing snap points
4. **Custom Snap Points**: User-defined snap locations
5. **Snap History**: Undo/redo for snap operations

### UI Improvements
1. **Snap Options Panel**: Dropdown for different snap positions
2. **Snap Preview**: Show preview of where objects will be positioned
3. **Snap Settings**: User preferences for snap behavior

## Testing

### Manual Testing Steps
1. Create a new canvas with some objects
2. Select different objects and test snap-to-center
3. Test with multiple selected objects
4. Verify keyboard shortcuts work
5. Check error handling with edge cases

### Expected Behavior
- Objects should center perfectly within the workspace
- Multiple objects should maintain relative positioning
- Button should be disabled when no selection
- Toast notifications should appear appropriately
- Changes should be saved automatically

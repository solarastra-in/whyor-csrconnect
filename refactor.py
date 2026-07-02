import re

with open('src/pages/EmployeeDashboard.tsx', 'r') as f:
    code = f.read()

# We need to replace from '{/* High-Level Stats */}' to '      <PostProjectSurvey'
start_idx = code.find('{/* High-Level Stats */}')
end_idx = code.find('      <PostProjectSurvey')

middle = code[start_idx:end_idx]

# Let's extract the widgets text
def get_between(text, start, end_str):
    idx1 = text.find(start)
    if idx1 == -1: return ""
    
    # We need to find the matching tag or just use string splits carefully.
    # It's easier to just do string matching
    pass

# Actually, I can just replace the layout part with DndContext and renderWidget
# since I can just copy the existing strings.

parts = {
    'stats': middle[middle.find('<div className="grid grid-cols-1 gap-5 sm:grid-cols-3">') : middle.find('<GamifiedEngagement />')],
    'gamification': '<GamifiedEngagement />',
    'hours': middle[middle.find('<div className="space-y-4">\n            <div className="flex items-center justify-between">\n              <h2 className="text-lg font-bold text-gray-900">Volunteer Hours (Last 6 Months)</h2>'): middle.find('<div className="space-y-4">\n            <div className="flex items-center justify-between">\n              <div>\n                <h2 className="text-lg font-bold text-gray-900">Active Pledged Projects</h2>')],
    'pledged': middle[middle.find('<div className="space-y-4">\n            <div className="flex items-center justify-between">\n              <div>\n                <h2 className="text-lg font-bold text-gray-900">Active Pledged Projects</h2>'): middle.find('<div className="space-y-4">\n            <div className="flex items-center justify-between">\n              <div>\n                <h2 className="text-lg font-bold text-gray-900">Suggested for You</h2>')],
    'suggested': middle[middle.find('<div className="space-y-4">\n            <div className="flex items-center justify-between">\n              <div>\n                <h2 className="text-lg font-bold text-gray-900">Suggested for You</h2>'): middle.find('</div>\n        </div>\n\n        {/* Gamification / Leaderboard Sidebar */}')] + '</div>',
    'leaderboard': middle[middle.find('<div className="space-y-4">\n          <h2 className="text-lg font-bold text-gray-900">Company Leaderboard</h2>'): middle.find('<Card>\n            <CardHeader className="pb-2">\n              <CardTitle className="text-sm">My Badges</CardTitle>')],
    'badges': middle[middle.find('<Card>\n            <CardHeader className="pb-2">\n              <CardTitle className="text-sm">My Badges</CardTitle>'): middle.find('<Card>\n            <CardHeader className="pb-2">\n              <CardTitle className="text-sm">Activity Feed</CardTitle>')],
    'activity': middle[middle.find('<Card>\n            <CardHeader className="pb-2">\n              <CardTitle className="text-sm">Activity Feed</CardTitle>'): middle.find('</div>\n      </div>')] + '</div>\n          </Card>'
}

# The badges extraction ends before activity feed
# The activity feed extraction ends before the closing divs

new_middle = """
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgetOrder} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {widgetOrder.map(id => {
              let content = null;
              let className = 'col-span-1';
              
              if (id === 'stats') {
                className = 'col-span-1 md:col-span-2 lg:col-span-3';
                content = (
                  WIDGET_STATS
                );
              } else if (id === 'gamification') {
                className = 'col-span-1 md:col-span-2 lg:col-span-3';
                content = WIDGET_GAMIFICATION;
              } else if (id === 'hours') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = (
                  WIDGET_HOURS
                );
              } else if (id === 'pledged') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = (
                  WIDGET_PLEDGED
                );
              } else if (id === 'suggested') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = (
                  WIDGET_SUGGESTED
                );
              } else if (id === 'leaderboard') {
                className = 'col-span-1';
                content = (
                  WIDGET_LEADERBOARD
                );
              } else if (id === 'badges') {
                className = 'col-span-1';
                content = (
                  WIDGET_BADGES
                );
              } else if (id === 'activity') {
                className = 'col-span-1';
                content = (
                  WIDGET_ACTIVITY
                );
              } else if (id === 'news') {
                className = 'col-span-1 md:col-span-2 lg:col-span-2';
                content = <CSRNewsFeed isAdmin={false} />;
              }
              
              return (
                <SortableWidget key={id} id={id} className={className}>
                  {content}
                </SortableWidget>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
"""

new_middle = new_middle.replace('WIDGET_STATS', parts['stats'])
new_middle = new_middle.replace('WIDGET_GAMIFICATION', parts['gamification'])
new_middle = new_middle.replace('WIDGET_HOURS', parts['hours'])
new_middle = new_middle.replace('WIDGET_PLEDGED', parts['pledged'])
new_middle = new_middle.replace('WIDGET_SUGGESTED', parts['suggested'])
new_middle = new_middle.replace('WIDGET_LEADERBOARD', parts['leaderboard'])
new_middle = new_middle.replace('WIDGET_BADGES', parts['badges'])
new_middle = new_middle.replace('WIDGET_ACTIVITY', parts['activity'])

final_code = code[:start_idx] + new_middle + code[end_idx:]

with open('src/pages/EmployeeDashboard.tsx', 'w') as f:
    f.write(final_code)

print("Done")

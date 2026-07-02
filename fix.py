with open('src/pages/EmployeeDashboard.tsx', 'r') as f:
    code = f.read()

# Replace the extra closing tags in WIDGET_ACTIVITY
code = code.replace(
'''
            </CardContent>
          </Card>
        </div>
          </Card>
                );
              } else if (id === 'news') {
''',
'''
            </CardContent>
          </Card>
                );
              } else if (id === 'news') {
'''
)

with open('src/pages/EmployeeDashboard.tsx', 'w') as f:
    f.write(code)


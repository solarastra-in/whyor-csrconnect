with open('src/pages/EmployeeDashboard.tsx', 'r') as f:
    code = f.read()

code = code.replace(
'''
              <button onClick={() => navigate('/employee/challenges')} className="w-full mt-4 text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center">
                View full rankings <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </CardContent>
          </Card>

          
                );
              } else if (id === 'badges') {
''',
'''
              <button onClick={() => navigate('/employee/challenges')} className="w-full mt-4 text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center justify-center">
                View full rankings <ArrowRight className="ml-1 h-3 w-3" />
              </button>
            </CardContent>
          </Card>
          </div>
                );
              } else if (id === 'badges') {
'''
)
with open('src/pages/EmployeeDashboard.tsx', 'w') as f:
    f.write(code)


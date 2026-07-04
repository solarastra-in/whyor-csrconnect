import re
with open('src/pages/Charities.tsx', 'r') as f:
    content = f.read()

# Replace the broken tabs tags near line 420
broken_section = """            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
          <TabsList className="m-4">
            <TabsTrigger value="all">All Charities</TabsTrigger>
            <TabsTrigger value="pending_verification">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">"""

fixed_section = """            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">"""

if broken_section in content:
    content = content.replace(broken_section, fixed_section)

# Check the very end of the file.
end_broken = """              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}"""
if end_broken not in content:
    # Let's fix the end by searching for "</div>\n            </CardContent>\n          </Card>\n        </TabsContent>"
    pass

with open('src/pages/Charities.tsx', 'w') as f:
    f.write(content)

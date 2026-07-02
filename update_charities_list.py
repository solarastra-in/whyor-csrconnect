with open('src/pages/Charities.tsx', 'r') as f:
    content = f.read()

new_useEffect = """  useEffect(() => {
    fetchProjects();
    fetchCharities();
  }, []);

  const fetchCharities = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'charities'));
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCharitiesList(prev => {
        // filter out mocks if they match, or just append. 
        // to be safe, let's just use fetched if it has items, otherwise mock.
        // Actually, let's combine them but avoid duplicates if we ran multiple times
        const mockMap = new Map(mockCharities.map(c => [c.id, c]));
        fetched.forEach(f => mockMap.set(f.id, f as any));
        return Array.from(mockMap.values());
      });
    } catch (error) {
      console.error(error);
    }
  };"""

content = content.replace("  useEffect(() => {\n    fetchProjects();\n  }, []);", new_useEffect)

# Fix approve/reject actions to also update db if the ID is a string (meaning it came from firestore)
bulk_old = """  const handleBulkAction = (action: string) => {
    if (selectedCharityIds.length === 0) return;
    
    setCharitiesList(prev => prev.map(c => {
      if (selectedCharityIds.includes(c.id)) {
        if (action === 'approve') return { ...c, status: 'approved' };
        if (action === 'archive') return { ...c, status: 'archived' };
        // If categorize, we could open a modal, but for now just show toast
      }
      return c;
    }));
    
    toast.success(`Successfully applied action: ${action} to ${selectedCharityIds.length} items`);
    setSelectedCharityIds([]);
  };"""

bulk_new = """  const handleBulkAction = async (action: string) => {
    if (selectedCharityIds.length === 0) return;
    
    const newStatus = action === 'approve' ? 'approved' : action === 'archive' ? 'archived' : '';
    
    if (newStatus) {
      for (const id of selectedCharityIds) {
        if (typeof id === 'string') { // It's from Firestore
          try {
            await updateDoc(doc(db, 'charities', id), { status: newStatus });
          } catch(e) {
            console.error(e);
          }
        }
      }
    }
    
    setCharitiesList(prev => prev.map(c => {
      if (selectedCharityIds.includes(c.id)) {
        if (action === 'approve') return { ...c, status: 'approved' };
        if (action === 'archive') return { ...c, status: 'archived' };
      }
      return c;
    }));
    
    toast.success(`Successfully applied action: ${action} to ${selectedCharityIds.length} items`);
    setSelectedCharityIds([]);
  };"""

content = content.replace(bulk_old, bulk_new)

# handleEditCharitySubmit update
edit_old = """  const handleEditCharitySubmit = () => {
    setCharitiesList(prev => prev.map(c => c.id === editingCharity.id ? editingCharity : c));
    toast.success('Charity details updated');
    setEditCharityOpen(false);
  };"""

edit_new = """  const handleEditCharitySubmit = async () => {
    if (typeof editingCharity.id === 'string') {
      try {
        const { id, activeProjects, ...updateData } = editingCharity;
        await updateDoc(doc(db, 'charities', id), updateData);
      } catch (e) {
        console.error(e);
        toast.error('Failed to update charity in database');
      }
    }
    setCharitiesList(prev => prev.map(c => c.id === editingCharity.id ? editingCharity : c));
    toast.success('Charity details updated');
    setEditCharityOpen(false);
  };"""

content = content.replace(edit_old, edit_new)

# And make sure selectedCharityIds accepts both numbers and strings
content = content.replace("useState<number[]>([])", "useState<any[]>([])")
content = content.replace("handleSelectCharity = (id: number", "handleSelectCharity = (id: any")

with open('src/pages/Charities.tsx', 'w') as f:
    f.write(content)

sed -i 's/const paginatedProperties = useMemo(() => {/const { data: pageData, isLoading, isFetching } = useAdminPropertiesQuery(\n    currentPage,\n    itemsPerPage,\n    { query: propertySearch, status: propertyStatusFilter },\n    propertySort === '"'"'newest'"'"' ? '"'"'createdAt'"'"' : propertySort === '"'"'price-asc'"'"' || propertySort === '"'"'price-desc'"'"' ? '"'"'price'"'"' : '"'"'createdAt'"'"',\n    propertySort === '"'"'price-asc'"'"' ? '"'"'asc'"'"' : '"'"'desc'"'"'\n  )\n  const { data: countsData } = useAdminCountsQuery({ query: propertySearch, status: propertyStatusFilter })\n  const totalFilteredCount = countsData?.totalFiltered || 0\n  const paginatedProperties = pageData || []\n  \/*/' src/features/admin/components/AdminProperties.tsx

sed -i 's/  }, \[filteredProperties, currentPage\])/  *\//' src/features/admin/components/AdminProperties.tsx

sed -i 's/{filteredProperties.length} records/{totalFilteredCount} records/g' src/features/admin/components/AdminProperties.tsx
sed -i 's/filteredProperties.length/totalFilteredCount/g' src/features/admin/components/AdminProperties.tsx


sed -i 's/import { useAdmin } from/import { useAdminPropertiesQuery, useAdminCountsQuery, useAdminPendingPropertiesQuery } from "@/features/admin/hooks/useAdminPropertiesQuery"\nimport { useAdmin } from/' src/features/admin/components/AdminOverview.tsx

sed -i 's/const pendingProperties = properties.filter((p) => p.moderationStatus === '"'"'pending'"'"')/const { data: pendingData } = useAdminPendingPropertiesQuery()\n  const pendingProperties = pendingData || []\n  const { data: countsData } = useAdminCountsQuery()\n  const pendingApprovalsCount = countsData?.pending || 0\n  const approvedListingsCount = countsData?.live || 0\n  \/*/' src/features/admin/components/AdminOverview.tsx

sed -i 's/enquiries,/enquiries,\n  } = props\n  *\//' src/features/admin/components/AdminOverview.tsx


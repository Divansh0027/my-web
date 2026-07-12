sed -i 's/import { Plus, Search, Trash2, CheckSquare, Edit, X, Check, MapPin, Building } from '"'"'lucide-react'"'"'/import { Plus, Search, Trash2, CheckSquare, Edit, X, Check, MapPin, Building, Loader2 } from '"'"'lucide-react'"'"'/g' src/features/admin/components/AdminProperties.tsx

sed -i '/import { useAdmin } from/a import { useAdminPropertiesQuery, useAdminCountsQuery } from "@/features/admin/hooks/useAdminPropertiesQuery"' src/features/admin/components/AdminProperties.tsx


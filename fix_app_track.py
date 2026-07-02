with open("src/App.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import { subscribeProperties, toggleFavorite, createProperty, updateProperty, checkIsAdmin } from "./firebase";',
    'import { subscribeProperties, toggleFavorite, createProperty, updateProperty, checkIsAdmin, trackEvent } from "./firebase";'
)

content = content.replace(
    'const handleToggleSaved = useCallback(async (id: string) => {',
    'const handleToggleSaved = useCallback(async (id: string) => {\n    trackEvent("toggle_saved_property", { property_id: id });'
)

content = content.replace(
    'const handleSearchTrigger = useCallback((searchFilters: { query?: string; location: string; type: string; budgetMax: number; bhk: string }) => {',
    'const handleSearchTrigger = useCallback((searchFilters: { query?: string; location: string; type: string; budgetMax: number; bhk: string }) => {\n    trackEvent("search", searchFilters);'
)

with open("src/App.tsx", "w") as f:
    f.write(content)

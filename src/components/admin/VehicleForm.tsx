// Thin re-export — VehicleForm was refactored from a 993-LOC monolith with
// 40+ useState slots into a react-hook-form orchestrator + focused
// subcomponents under src/components/admin/vehicle-form/. Callers
// (admin/vehicles/new, admin/vehicles/[id]/edit, VehicleCatalog) import
// from here unchanged.
export { VehicleForm } from './vehicle-form/VehicleForm'

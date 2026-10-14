package permissions

const (
	AccessPanel    = "access.panel"
	ClientsView    = "clients.view"
	ClientsManage  = "clients.manage"
	ProductsManage = "products.manage"
	ServicesManage = "services.manage"
	InvoicesManage = "invoices.manage"
	PaymentsRefund = "payments.refund"
	SettingsManage = "settings.manage"
)

type Permission struct {
	Name        string
	Description string
}

var All = []Permission{
	{AccessPanel, "Access the panel"},
	{ClientsView, "View client accounts and their services"},
	{ClientsManage, "Edit, suspend and delete client accounts"},
	{ProductsManage, "Create and edit products and pricing"},
	{ServicesManage, "Provision, suspend and terminate services"},
	{InvoicesManage, "Create, edit and cancel invoices"},
	{PaymentsRefund, "Issue refunds"},
	{SettingsManage, "Change system settings"},
}

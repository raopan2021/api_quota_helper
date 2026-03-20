using Avalonia.Controls;
using ApiQuotaHelper.ViewModels;

namespace ApiQuotaHelper;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new MainViewModel();
    }
}

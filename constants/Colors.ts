const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const tintColorRed = '#b62828'; //COR DOS ICONES DO TABBAR
const tintColorBlue = '#0a7ea4';
const vencidaLight = '#ff4d4d';  // Vermelho suave, mas visível no modo claro  
const vencidaDark = '#ff4d4d';   // Vermelho médio no escuro, sem perder contraste  

export const Colors = {
  light: {
    text: '#11181C',
    icoTab: '#0D0F16',
    backgroundTab: 'rgba(255, 255, 255, 0.01)', // Branco com 10% de opacidade
    backgroundDarkTab: '#000',
    background: '#fff',
    bottomSheetBackground: '#cccccc',
    cardBackground: '#f1f1f1', //DEFINE A COR SE FOR NO MODO ESCURO E A COR BRANCA NAO DA PRA VER A HORA
    tint: tintColorRed,
    vencida: vencidaLight,
    overlay: 'rgba(0, 0, 0, 0.4)',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconDefaultDark: '#000',
    tabIconSelected: tintColorLight,
    placeholder: '#888', 
    border: '#ccc', 
    inputBackground: '#f1f1f1', 
    buttonBackground: '#0a7ea4',
    buttonText: '#fff', 
    success: '#4caf50', 
    error: '#f44336', 
    info: '#1976D2',
    warning: '#ff9800',
    switchTrackFalse: '#ccc',
    switchTrackTrue: '#4cd137', 
    switchThumb: '#fff',        
  },
  dark: {
    text: '#ECEDEE',
    icoTab: '#fff',
    backgroundTab: 'rgba(255, 255, 255, 0.01)',
    backgroundDarkTab: 'rgba(255, 255, 255, 0.01)',
    background: '#0D0F16', //DEFINE A COR SE FOR NO MODO ESCURO E A COR BRANCA NAO DA PRA VER A HORA
    bottomSheetBackground: '#1A1D22',
    cardBackground: '#2A2D35', 
    tint: tintColorRed,
    vencida: vencidaDark,
    overlay: 'rgba(0, 0, 0, 0.6)', 
    icon: '#9BA1A6', //COR DOS ICONES DE DENTRO DO CARD
    tabIconDefault: '#9BA1A6',
    tabIconDefaultDark: '#9BA1A6',
    tabIconSelected: tintColorDark,
    placeholder: '#aaa',
    border: '#555',
    inputBackground: '#2A2D35',
    buttonBackground: '#0a7ea4',
    buttonText: '#fff',
    success: '#4caf50',
    error: '#f44336',
    info: '#1976D2',
    warning: '#ff9800',
    switchTrackFalse: '#555',  // Cor para o estado "off"
    switchTrackTrue: '#4cd137', // Cor para o estado "on"
    switchThumb: '#fff',        // Cor da bolinha
  },
};

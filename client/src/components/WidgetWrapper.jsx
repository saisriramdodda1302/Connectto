export default function WidgetWrapper({ children, className = "", sx = {}, ...props }) {
  return (
    <div 
      className={`p-6 sm:p-8 bg-white dark:bg-[#2A2A2A] rounded-3xl shadow-sm border border-neutral-100 dark:border-neutral-800 transition-colors duration-300 ${className}`} 
      style={{
        marginTop: props.mt,
        marginBottom: props.mb,
        margin: props.m,
        padding: props.p,
        ...sx,
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
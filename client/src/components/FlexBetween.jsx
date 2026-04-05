export default function FlexBetween({ children, className = "", sx = {}, ...props }) {
  return (
    <div 
      className={`flex justify-between items-center ${className}`} 
      style={{
        marginTop: props.mt,
        marginBottom: props.mb,
        margin: props.m,
        padding: props.p,
        gap: props.gap,
        ...sx,
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
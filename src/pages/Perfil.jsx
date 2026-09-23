import { Link } from "react-router-dom";
function Perfil() {
    return (
        <div className="perfil-container"> 
        <div className="perfil-header">
           <Link to="/inicio" className="menu-item">
  ←
</Link>
             <div className="perfil-foto"> 👤 </div> 
             <div className="perfil-titulo"> 
                <h1>Juan Pérez</h1> 
                <p>Colaborador</p> </div> 
                 </div> 
        <div className="perfil-contenido"> 
            <div className="perfil-card"> 
                <h2>Información personal</h2> 
                <div className="dato"> 
                    <span>Nombre completo</span> 
                    <strong>Juan Pérez</strong> </div> 
        <div className="dato"> 
            <span>Correo electrónico</span> 
            <strong>juan.perez@empresa.com</strong> </div> 
        <div className="dato"> 
            <span>Teléfono</span> 
            <strong>555 123 4567</strong> </div> </div> 
        <div className="perfil-card"> 
                <h2>Información laboral</h2> 
                <div className="dato"> 
                    <span>Puesto</span> 
                    <strong>Colaborador</strong> </div> 
        <div className="dato"> <span>Departamento</span> <strong>Recursos Humanos</strong> </div> 
        <div className="dato"> <span>Fecha de ingreso</span> <strong>10 de enero de 2025</strong> </div> </div> </div> </div>
    )
}
export default Perfil
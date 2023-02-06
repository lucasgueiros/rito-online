import './App.css';
import { useState, useEffect } from 'react';
import http from './http';

function App() {
  const [data, setData] = useState();
  const [time, setTime] = useState(Date.now());
  const [pagina, setPagina] = useState(1);
  const [password, setPassword] = useState("");
  const [atual, setAtual] = useState(true);
  const controle = window.location.pathname == "/controle";


  const atualizar = () => {
  }

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    http.get('/rito', {
      params: {
        pagina: pagina,
        atual: atual,
      }
    }).then((content) => {
      setData(content);
      if (atual) {
        setPagina(content.data.id)
      }
    })
  }, [time, pagina, atual])

  useEffect(() => {
    if (controle) {
      http.post('/alterar', {
          pagina: pagina.toString(),
          senha: password,
      })
    }

  }, [pagina, controle]);

  if (!data) {
    return <p>Carregando...</p>
  }
  return (
    <div className="App">
      <h3>{data.data.titulo}</h3>
      <table>
        <tbody>
          <tr>
            <td colSpan={2} style={{ width: '50%' }}>{data.data.portugues}</td>
            <td colSpan={2} style={{ width: '50%' }}>{data.data.latim}</td>
          </tr>

          <tr>
            <td><input type="button" value={"Anterior"} onClick={() => {
              setPagina(parseInt(pagina) - 1).then(() => atualizar());
            }} disabled={atual || pagina == 1} /></td>
            <td><input type="button" value={atual ? "Sincronizado" : "Não sincronizado!"} onClick={() => {
              setAtual(!atual).then(() => atualizar());
            }} /></td>
            <td><input type="button" value={"Próximo"} onClick={() => {
              setPagina(parseInt(pagina) + 1).then(() => atualizar());
            }} disabled={atual} /></td>
          </tr>
          <tr>
            <td colSpan={4}>Página {pagina}</td>
          </tr>
        </tbody>

        {/* CONTROLES ESPECIAIS */}
        <tfoot hidden={!controle}>
          <tr>
            <td colSpan={4} >
              <input type="password" value={password} onChange={(event) => {
                setPassword(event.target.value);
              }} />
            </td>
          </tr>
        </tfoot>

      </table>
    </div>
  );
}

export default App;

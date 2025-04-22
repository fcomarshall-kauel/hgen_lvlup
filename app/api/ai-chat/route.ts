import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const additional_information = "Hoy interactuarás con el Dr. Sergio Cedano Rivera, un médico internista de Integramédica en Providencia, Santiago, quien tiene 64 años. Al dirigirte a él, utiliza un tono formal casual y aprovecha sus intereses personales para generar confianza. El Dr. Cedano disfruta del ajedrez, ama tanto la montaña como el mar y colecciona motocicletas. Puedes preguntarle sobre su última partida de ajedrez o si ha añadido alguna motocicleta especial a su colección. Asegúrate de felicitarlo por su cumpleaños el 31 de enero y menciona su gusto por la comida italiana y el jazz. Además, ofrece servicios de telemedicina y trabaja con la Isapre Banmédica, lo cual podría ser relevante para la conversación.";

    const response = await fetch(
//      `https://server.ai-labhelper.com/api/chat?session_id=666288c3bbdeec47501c57e2&message=${encodeURIComponent(message)}&thread_id=ailabs_test_demo_01&additional_information=${encodeURIComponent(additional_information)}`,
      `https://server.ai-labhelper.com/api/chat_streaming?box_id=666288c3bbdeec47501c57e2&message=${encodeURIComponent(message)}&plain_output=false`,
      
      {
        method: 'POST',
        headers: {
          'accept': 'application/json'
        }
      }
    );
    
    const data = await response.text();
    return new Response(data, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from AI server' },
      { status: 500 }
    );
  }
}
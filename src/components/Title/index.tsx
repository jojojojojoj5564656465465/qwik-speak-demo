import { component$ } from "@builder.io/qwik";


export interface IndexProps {
  text: string;
}

export const Title = component$<IndexProps>((props) => {

  return (
			<h1>
				{props.text}
			</h1>
		);
});
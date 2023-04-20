import gql from 'graphql-tag';

export default gql`
query {
	listLobby {
		id
        players {
            id
            name
        }
        totalPlayers
	}
  }
`;
import {Dimensions, StyleSheet} from 'react-native';

export default StyleSheet.create({
  max: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#38373A',
    marginBottom: 16,
    borderRadius:10,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  fullView: {
    flex: 5,
    alignContent: 'center',
    marginHorizontal: 24,
  },
  subHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  waitText: {
    marginTop: 50,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  roleText: {
    textAlign: 'center',
    // fontWeight: '700',
    color: '#fbfbfb',
    fontSize: 18,
  },
  spacer: {
    width: '100%',
    padding: '2%',
    marginBottom: 32,
    // borderWidth: 1,
    backgroundColor: '#38373A',
    color: '#fbfbfb',
    // borderColor: '#38373A',
  },
  input: {
    height: 40,
    borderColor: '#38373A',
    borderWidth: 1.5,
    width: '100%',
    alignSelf: 'center',
    padding: 10,
    marginBottom: 10,
    borderRadius:10
  },
  roomsBtn: {
    padding: 8,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius:5,
    width:150,
    height:150,
    justifyContent:"center",
    alignItems:"center"
  },
  roomHead: {fontWeight: 'bold', color: 'red', fontSize: 16},
  whiteText: {color: 'red'},
  video: {width: "100%", height: Dimensions.get("screen").height,borderColor:"gray",borderWidth:0.5},
});

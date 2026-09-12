import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Svg, { Rect, Path } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor, ReduceMotion } from 'react-native-reanimated';
export function Landscape({ night }: { night: number }) {
  const light = useSharedValue(night);
  useEffect(() => { light.value = withTiming(night, {duration: 2000, reduceMotion: ReduceMotion.System}); }, [night]);
  const sky = useAnimatedStyle(() => ({backgroundColor: interpolateColor(light.value, [0,1], ['#BFE8F9','#414858'])}));
  return (
    <Animated.View
      style={[{ height: 120, overflow: "hidden" }, sky]}
      accessibilityLabel={
        night > 0.5 ? "Moonlit village landscape" : "Sunny village landscape"
      }
    >
      <Svg
        width="100%"
        height={120}
        viewBox="0 0 360 120"
        preserveAspectRatio="xMidYMax slice"
      >
        <Rect
          x="277"
          y="14"
          width="23"
          height="23"
          fill={night > 0.5 ? "#EAE6BF" : "#F7C948"}
        />
        {night > 0.5 ? (
          <>
            {[
              [32, 18],
              [104, 32],
              [203, 13],
              [335, 47],
              [162, 51],
            ].map(([x, y], i) => (
              <Rect key={i} x={x} y={y} width="3" height="3" fill="#FFF4E3" />
            ))}
          </>
        ) : (
          <>
            <Path
              d="M35 27h16v-6h24v6h12v10H35z M166 17h12v-5h19v5h20v9h-51z"
              fill="#FFF7EA"
            />
          </>
        )}
        <Path
          d="M0 75h27V65h37V51h31v14h26v14h45V63h22V49h39v14h35v13h28V59h38V46h32v74H0z"
          fill={night > 0.5 ? "#455E65" : "#8FB85E"}
        />
        <Path
          d="M0 95h34V84h56v9h32V82h70v9h61V79h45v9h62v32H0z"
          fill={night > 0.5 ? "#354E50" : "#6B8E3B"}
        />
        <Rect x="147" y="69" width="59" height="43" fill="#E89B52" />
        <Path d="M140 70v-7h7v-7h8v-7h43v7h8v7h8v7z" fill="#9E451C" />
        <Rect x="157" y="80" width="12" height="12" fill="#FFF1C6" />
        <Rect x="183" y="84" width="13" height="28" fill="#662305" />
        <Rect x="0" y="113" width="360" height="7" fill="#6B8E3B" />
      </Svg>
      <Text
        style={{
          position: "absolute",
          bottom: 7,
          right: 12,
          color: "#FFF4E3",
          fontFamily: "monospace",
          fontSize: 9,
        }}
      >
        HOME, SWEET LITTLE HOME
      </Text>
    </Animated.View>
  );
}

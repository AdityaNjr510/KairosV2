function onOpen() {
    DocumentApp.getUi()
      .createMenu('Kairos')
      .addItem('Open Sidebar', 'showSidebar')
      .addToUi();
  }
  
  function showSidebar() {
    const html = HtmlService.createHtmlOutputFromFile('Sidebar')
      .setTitle("Kairos for Personalized Learning")
      .setWidth(400);
    DocumentApp.getUi().showSidebar(html);
  }

  function getUserEmail() {
    var user_email = Session.getActiveUser().getEmail();
    const identity_url = 'https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/identity-fetch';
    const payload = {
      email_id: user_email,
    };
    const options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,  // Important to get response even if it's 401/403 etc.
    };

    const response = UrlFetchApp.fetch(identity_url, options);

    const responseText = response.getContentText();
    const responseJson = JSON.parse(responseText);

    return {
      statusCode: response.getResponseCode(),
      email: user_email,
      role: responseJson.role
    }
  }
  function callOpenAI(prompt) {
  const baseUrl = 'https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke';

  const payload = {
    action: "advice",
    payload: {
      message: prompt,
      email_id: Session.getActiveUser().getEmail()
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(baseUrl, options);
    const result = JSON.parse(response.getContentText());

    Logger.log("🔁 Full advice response:");
    Logger.log(result);

    // ✅ Return the entire object — not just result.recommendation.advice
    return result;
  } catch (error) {
    Logger.log("❌ Error fetching from OpenAI Lambda:");
    Logger.log(error);
    return {
      recommendation: {
        advice: "No response available",
        subject: "",
        connection: "",
        examples: [],
        resources: []
      }
    };
  }
}

function generateProject(prompt) {
  const baseUrl = 'https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke'; // Lambda URL

  const payload = {
    action: "createproject",
    payload: {
      message: prompt,
      email_id: Session.getActiveUser().getEmail(),
    }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(baseUrl, options);
  const result = JSON.parse(response.getContentText());

  return JSON.stringify(result.json.project) || "No response available";
}

function processDailyCheckin(userInput) {
  console.log("this is from processDailyCheckin");
  const url = 'https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke';
  
  const payload = {
    action: "morningpulse",
    payload: {
      email_id: Session.getActiveUser().getEmail(),
      emoji: userInput.emoji,
      route: "daily-checkin",
      message: userInput.message
    }
  };
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);

    console.log('API Response Status:', response.getResponseCode());
    
    const result = JSON.parse(response.getContentText());
    console.log('API Response:', result);
    if( result.statusCode == 200)
      console.log("status 200 received")
    
    // Return the project data or fallback message
    return JSON.parse(JSON.stringify(result?.action_response?.response)) || "No response available";
  } catch (error) {
    console.error('Error processing daily check-in:', error.toString());
    
    // Return a fallback response instead of throwing
    const fallbackResponses = [
      "Thank you for your daily check-in! Keep up the great work! 🌟",
      "Great job starting your day with intention! 🌟",
      "Your mindful check-in sets a positive tone for the day ahead! ✨",
      "Thank you for taking a moment to reflect. Keep up the amazing work! 💪"
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}

function callAIServiceInitiation(userInput) {
  console.log("this is from callAIServiceInitiation");
  const url = 'https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke';
  
  const payload = {
    action: "guideme",
    payload: {
      email_id: Session.getActiveUser().getEmail(),
      message: userInput.message,
      context: {
        mode: userInput.context.mode,
        focus: userInput.context.focus,
        course: userInput.context.course,
        grade: userInput.context.grade,
        readingLevel: userInput.context.readingLevel,
        standards: userInput.context.standards,
        pastedContent: userInput.context.pastedContent
      }
    }
  }; 
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    console.log('API Response Status from GuideMe Initiation:', response.getResponseCode());
    
    const result = JSON.parse(response.getContentText());
    console.log('API Response Initiation:', result);
    
    if (result.statusCode == 200) {
      console.log("status 200 received");
    }
    
    // Check if the response has the expected structure
    if (result.status === "success" && result.action_response) {
      // Return the properly structured response that matches what your frontend expects
      return {
        message: result.action_response.response,
        conversation_id: result.action_response.conversation_id,
        generatedAt: result.action_response.generatedAt,
        citations: [] // Add empty citations array if not provided by backend
      };
    } else {
      // Return error structure
      return {
        error: "Invalid response structure",
        message: "No response available"
      };
    }
    
  } catch (error) {
    console.error('Error processing AI initiation request:', error.toString());
    // Return error structure that frontend can handle
    return {
      error: error.toString(),
      message: "Error connecting to AI service"
    };
  }
}

function callAIServiceContinue(userInput) {
  console.log("this is from callAIServiceContinue");
  const url = 'https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke';
  
  const payload = {
    action: "guideme",
    payload: {
      email_id: Session.getActiveUser().getEmail(),
      message: userInput.message,
      conversation_id: userInput.conversation_id
    }
  }; 
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    console.log('API Response Status from GuideMe Continue:', response.getResponseCode());
    
    const result = JSON.parse(response.getContentText());
    console.log('API Response Continue:', result);
    
    if (result.statusCode == 200) {
      console.log("status 200 received");
    }
    
    // Check if the response has the expected structure
    if (result.status === "success" && result.action_response) {
      // Return the properly structured response that matches what your frontend expects
      return {
        message: result.action_response.response,
        conversation_id: result.action_response.conversation_id,
        generatedAt: result.action_response.generatedAt,
        citations: [] // Add empty citations array if not provided by backend
      };
    } else {
      // Return error structure
      return {
        error: "Invalid response structure",
        message: "No response available"
      };
    }
    
  } catch (error) {
    console.error('Error processing AI continue request:', error.toString());
    // Return error structure that frontend can handle
    return {
      error: error.toString(),
      message: "Error connecting to AI service"
    };
  }
}

function getStudentProjectsForTeacher() {
  // Mocked data - replace with real data fetch from Sheets or DB
  return [
    {
      title: 'Climate Change Research',
      studentEmail: 'student1@example.com',
      summary: 'A summary of key climate change challenges and mitigation strategies.',
      docLink: 'https://docs.google.com/document/d/xxxxxxx',
    },
    {
      title: 'AI in Healthcare',
      studentEmail: 'student2@example.com',
      summary: 'Exploring applications of machine learning in medical diagnosis.',
      docLink: 'https://docs.google.com/document/d/yyyyyyy',
    },
  ];
}

function findExperts(message) {
  const baseUrl = 'https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke';
  const payload = {
    action: "helpme",
    payload: {
      message: message,
      geolocation: "Tucson, AZ", // You can make this dynamic
      email_id: "student2@gmail.com" // Gets the current user's email
    }
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(baseUrl, options);
    const result = JSON.parse(response.getContentText());
    Logger.log(result);
    return result;
  } catch (error) {
    Logger.log('Error finding experts: ' + error.toString());
    throw error;
  }
}

function submitFormToScript(payload){
  Logger.log(payload)
}

function callMorningPulseAPI(payload) {
  const baseUrl = 'https://a3trgqmu4k.execute-api.us-west-1.amazonaws.com/prod/invoke';

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(baseUrl, options);
    const result = JSON.parse(response.getContentText());
    Logger.log('Morning pulse API response:', result);
    return result;
  } catch (error) {
    console.error('Error calling morning pulse API:', error);
    throw error;
  }
}